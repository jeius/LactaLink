import { FieldResolver } from '@/lib/utils/collections/FieldResolver';
import {
  Collection,
  Notification,
  NotificationCategory,
  NotificationChannel,
  NotificationChannelStats,
  NotificationType,
  User,
} from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { Operation, Payload, PayloadRequest, SanitizedCollectionConfig, Where } from 'payload';
import { ChannelFactory } from './channels';
import { TemplateProcessor } from './processors';
import { CreateNotificationParams } from './types';
import { TemplateValidator } from './validators';
import { TriggerValidator } from './validators/TriggerValidator';

export class NotificationService {
  private templateValidator: TemplateValidator;
  private templateProcessor: TemplateProcessor;
  private channelFactory: ChannelFactory;
  private payload: Payload;

  constructor(
    private payloadReq: PayloadRequest,
    private collection: SanitizedCollectionConfig
  ) {
    this.payload = payloadReq.payload;
    this.templateValidator = new TemplateValidator();
    this.templateProcessor = new TemplateProcessor({ allowMissingVariables: true });
    this.channelFactory = new ChannelFactory(payloadReq.payload);
  }

  async handleTriggers(operation: Operation, doc: Collection, previousDoc?: Collection | null) {
    const collectionSlug = this.collection.slug;
    const resolver = new FieldResolver(this.payload, this.collection, doc);

    const fullDoc = await this.prepareFullDoc(doc, resolver, operation);

    // Fetch notification types with matching triggers
    const notificationTypes = await this.payload.find({
      collection: 'notificationTypes',
      req: this.payloadReq,
      where: {
        'trigger.collection': { equals: collectionSlug },
        'trigger.event': { equals: operation.toUpperCase() },
      },
    });

    const resolvedData: {
      relatedData: NonNullable<Notification['relatedData']>;
      variables: Record<string, unknown>;
      notificationType: NotificationType;
    }[] = [];

    for (const notificationType of notificationTypes.docs) {
      const trigger = notificationType.trigger;
      const trigValidator = new TriggerValidator(trigger, doc, previousDoc);

      if (trigValidator.validate()) {
        resolvedData.push({
          relatedData: resolver.resolveRelatedData(notificationType, fullDoc),
          variables: resolver.resolveVariables(notificationType, fullDoc),
          notificationType: notificationType,
        });
      }
    }

    return resolvedData;
  }

  /**
   * Create a new notification
   * This method validates the notification type, processes templates,
   * builds channel stats, and creates the notification in the database.
   * It also sends the notification immediately if not scheduled for later.
   */
  async createNotification({
    doc,
    recipient,
    previousDoc,
    operation,
    additionalVariables = {},
  }: CreateNotificationParams): Promise<Notification[]> {
    const data = await this.handleTriggers(operation, doc, previousDoc);

    if (data.length === 0) {
      this.payload.logger.info(
        `No notification types matched for ${operation} operation on ${this.collection.slug}`
      );
      return [];
    }

    const notifications: Notification[] = [];

    for (const { notificationType, relatedData, variables } of data) {
      const allVariables = { ...variables, ...additionalVariables };

      this.templateValidator.validate(notificationType, allVariables, {
        allowExtraVariables: true,
      });

      // Process templates
      const title = this.templateProcessor.process(notificationType.template.title, allVariables);
      const message = this.templateProcessor.process(
        notificationType.template.message,
        allVariables
      );

      // Build channel stats
      const channelsStats = await this.buildChannelStats(this.getDefaultChannels(notificationType));

      // Create notification
      const notification = await this.payload.create({
        collection: 'notifications',
        depth: 3,
        req: this.payloadReq,
        data: {
          recipient,
          notificationType: notificationType.id,
          priority: notificationType.priority,
          title,
          message,
          variables: allVariables,
          read: false,
          relatedData,
          delivery: { channelsStats },
        },
        populate: { [this.collection.slug]: {} },
      });

      // Send if not scheduled
      for (const stat of channelsStats) {
        if (!stat.scheduled) {
          await this.sendNotification(notification);
        }
      }
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Send notification through all active channels
   * This method will send the notification immediately if no channels are scheduled,
   * or schedule it for later if specified.
   */
  async sendNotification(notification: Notification): Promise<Notification> {
    const updatedStats: NotificationChannelStats = await Promise.all(
      notification.delivery.channelsStats.map(async (stat) => {
        const channel = await this.channelFactory.createChannel(extractID(stat.channel));
        return await channel.send(notification, stat);
      })
    );

    await this.updateDeliveryStats(notification.id, updatedStats);
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
      req: this.payloadReq,
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
      req: this.payloadReq,
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
      req: this.payloadReq,
    });
  }

  private async buildChannelStats(
    channelIds: NotificationChannel['id'][],
    scheduledFor?: NotificationChannelStats[number]['scheduledFor']
  ): Promise<NotificationChannelStats> {
    const channels = await this.payload.find({
      collection: 'notificationChannels',
      req: this.payloadReq,
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

  private async updateDeliveryStats(
    notificationId: Notification['id'],
    updatedStats: NotificationChannelStats
  ): Promise<void> {
    await this.payload.update({
      collection: 'notifications',
      id: notificationId,
      req: this.payloadReq,
      data: {
        delivery: {
          channelsStats: updatedStats,
        },
      },
    });
  }

  private async prepareFullDoc(
    doc: Collection,
    resolver: FieldResolver,
    operation: Operation
  ): Promise<Collection> {
    this.payload.logger.info(doc, `Preparing full document for collection ${this.collection.slug}`);
    // this.payload.logger.info(this.collection.fields, 'Collection fields');

    // Initialize an empty object to hold the full document
    const fullDoc: Omit<Collection, 'createdAt' | 'updatedAt'> = { id: doc.id };

    // Iterate through all fields in the collection
    for (const field of this.collection.fields) {
      await resolver.resolveField(field, doc, '', fullDoc);
    }

    this.payload.logger.info(
      fullDoc,
      `Resolved full document for ${operation} operation on ${this.collection.slug}`
    );
    return fullDoc as Collection;
  }
}
