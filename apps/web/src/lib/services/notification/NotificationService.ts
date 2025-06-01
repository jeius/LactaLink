import {
  Notification,
  NotificationCategory,
  NotificationChannel,
  NotificationChannelStats,
  NotificationType,
  User,
} from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { Payload, Where } from 'payload';
import { ChannelFactory } from './channels';
import { TemplateProcessor } from './processors';
import { CreateNotificationParams } from './types';
import { TemplateValidator } from './validators';

export class NotificationService {
  private templateValidator: TemplateValidator;
  private templateProcessor: TemplateProcessor;
  private channelFactory: ChannelFactory;

  constructor(private payload: Payload) {
    this.templateValidator = new TemplateValidator();
    this.templateProcessor = new TemplateProcessor();
    this.channelFactory = new ChannelFactory(payload);
  }

  /**
   * Create a new notification
   * This method validates the notification type, processes templates,
   * builds channel stats, and creates the notification in the database.
   * It also sends the notification immediately if not scheduled for later.
   */
  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    const notificationType = await this.getNotificationTypeByKey(params.typeKey);

    // Validate variables
    this.templateValidator.validate(notificationType, params.variables);

    // Process templates
    const title =
      params.overrides?.title ||
      this.templateProcessor.process(notificationType.template.title, params.variables);
    const message =
      params.overrides?.message ||
      this.templateProcessor.process(notificationType.template.message, params.variables);

    // Build channel stats
    const channelsStats = await this.buildChannelStats(
      params.overrides?.channels || this.getDefaultChannels(notificationType),
      params.overrides?.scheduledFor
    );

    // Create notification
    const notification = await this.payload.create({
      collection: 'notifications',
      data: {
        recipient: params.recipient,
        notificationType: notificationType.id,
        priority: params.overrides?.priority || notificationType.priority,
        title,
        message,
        variables: params.variables,
        read: false,
        relatedData: params.relatedData,
        delivery: { channelsStats },
      },
    });

    // Send if not scheduled
    if (!params.overrides?.scheduledFor) {
      await this.sendNotification(notification.id);
    }

    return notification;
  }

  /**
   * Send notification through all active channels
   * This method will send the notification immediately if no channels are scheduled,
   * or schedule it for later if specified.
   */
  async sendNotification(notificationId: Notification['id']): Promise<Notification> {
    const notification = await this.getNotificationById(notificationId);

    const updatedStats: NotificationChannelStats = await Promise.all(
      notification.delivery.channelsStats.map(async (stat) => {
        const channel = await this.channelFactory.createChannel(extractID(stat.channel));
        return await channel.send(notification, stat);
      })
    );

    await this.updateDeliveryStats(notificationId, updatedStats);
    return notification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: Notification['id'], userId: User['id']): Promise<Notification> {
    const notification = await this.payload.findByID({
      collection: 'notifications',
      id: notificationId,
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.recipient !== userId) {
      throw new Error('Unauthorized');
    }

    return await this.payload.update({
      collection: 'notifications',
      id: notificationId,
      data: {
        read: true,
        readAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Get active notification types (optionally filtered by category)
   */
  async getActiveNotificationTypes(
    category?: NotificationCategory['key']
  ): Promise<NotificationType[]> {
    const where: Where = { active: { equals: true } };
    if (category) {
      where['category.key'] = { equals: category };
    }

    const res = await this.payload.find({
      collection: 'notificationTypes',
      where,
      depth: 1,
      pagination: false,
    });

    return res.docs;
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: User['id'],
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    } = {}
  ) {
    const where: Where = { recipient: { equals: userId } };

    if (options.unreadOnly) {
      where.read = { equals: false };
    }

    return await this.payload.find({
      collection: 'notifications',
      where,
      page: options.page || 1,
      limit: options.limit || 10,
      sort: '-createdAt',
      depth: 2,
    });
  }

  private async buildChannelStats(
    channelIds: NotificationChannel['id'][],
    scheduledFor?: NotificationChannelStats[number]['scheduledFor']
  ): Promise<NotificationChannelStats> {
    const channels = await this.payload.find({
      collection: 'notificationChannels',
      where: {
        id: { in: channelIds },
        active: { equals: true },
      },
      pagination: false,
    });

    return channels.docs.map((channel) => ({
      channel: channel.id,
      scheduled: !!scheduledFor,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      sent: false,
      attempts: 0,
    }));
  }

  private getDefaultChannels(notificationType: NotificationType): NotificationChannel['id'][] {
    if (!notificationType.defaultChannels || !notificationType.defaultChannels.length) {
      throw new Error(`Notification type ${notificationType.key} has no default channels defined`);
    }

    const channels = notificationType.defaultChannels.map((channel) => extractID(channel));
    return channels;
  }

  private async getNotificationTypeByKey(typeKey: string): Promise<NotificationType> {
    const notificationType = await this.payload.find({
      collection: 'notificationTypes',
      where: {
        key: { equals: typeKey },
        active: { equals: true },
      },
      depth: 2, // Include category and default channels
      pagination: false,
      limit: 1,
    });

    if (!notificationType.docs.length) {
      throw new Error(`Notification type ${typeKey} not found or inactive`);
    }

    const type = notificationType.docs[0];
    if (!type?.template || !type.template.title || !type.template.message) {
      throw new Error(`Notification type ${typeKey} is missing required templates`);
    }

    return type;
  }

  private async getNotificationById(notificationId: Notification['id']): Promise<Notification> {
    const notification = await this.payload.findByID({
      collection: 'notifications',
      id: notificationId,
      populate: {
        users: { profile: true, profileType: true, email: true, phone: true },
        individuals: { displayName: true },
        hospitals: { name: true },
        milkBanks: { name: true },
      },
      depth: 3,
    });

    if (!notification) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }

    return notification;
  }

  private async updateDeliveryStats(
    notificationId: Notification['id'],
    updatedStats: NotificationChannelStats
  ): Promise<void> {
    await this.payload.update({
      collection: 'notifications',
      id: notificationId,
      data: {
        delivery: {
          channelsStats: updatedStats,
        },
      },
    });
  }
}
