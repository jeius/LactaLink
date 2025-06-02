import { getRequestCollection } from '@/lib/utils/getRequestEntity';
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
import { Operation, Payload, PayloadRequest, Where } from 'payload';
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

  constructor(private payloadReq: PayloadRequest) {
    this.payload = payloadReq.payload;
    this.templateValidator = new TemplateValidator();
    this.templateProcessor = new TemplateProcessor();
    this.channelFactory = new ChannelFactory(payloadReq.payload);
  }

  async handleTriggers(operation: Operation, doc: Collection, previousDoc?: Collection | null) {
    const collection = getRequestCollection(this.payloadReq);
    const collectionSlug = collection.config.slug;

    // Fetch notification types with matching triggers
    const notificationTypes = await this.payload.find({
      collection: 'notificationTypes',
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
          relatedData: this.resolveRelatedData(notificationType, doc),
          variables: this.resolveVariables(notificationType, doc),
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
      });

      // Send if not scheduled
      for (const stat of channelsStats) {
        if (!stat.scheduled) {
          await this.sendNotification(notification.id);
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

  private async getNotificationById(notificationId: Notification['id']): Promise<Notification> {
    const notification = await this.payload.findByID({
      collection: 'notifications',
      id: notificationId,
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

  private resolveRelatedData(
    notificationType: NotificationType,
    doc: Collection
  ): NonNullable<Notification['relatedData']> {
    const template = notificationType.template;
    const collection = getRequestCollection(this.payloadReq);
    const collectionSlug = collection.config.slug as 'deliveries' | 'donations' | 'requests';

    if (template.actionUrl && template.actionLabel) {
      return {
        data: { relationTo: collectionSlug, value: doc.id },
        actionUrl: template.actionUrl.replace('{{id}}', doc.id),
        actionLabel: template.actionLabel,
      };
    }
    return {
      data: { relationTo: collectionSlug, value: doc.id },
      actionUrl: `/${collectionSlug}/${doc.id}`,
      actionLabel: `View ${collection.config.labels.singular}`,
    };
  }

  private resolveVariables(
    notificationType: NotificationType,
    doc: Collection
  ): Record<string, unknown> {
    const variables: Record<string, unknown> = {};
    const template = notificationType.template;

    if (!template || !template.variables) {
      return variables; // No variables to resolve
    }

    for (const { key, path, defaultValue } of template.variables) {
      if (!path) {
        variables[key] = defaultValue; // Use default value if no path is provided
        continue;
      }

      // Resolve the value from the document using the path
      const value = this.resolvePath(doc, path);

      // Use the resolved value or default
      variables[key] = value !== undefined ? value : defaultValue;
    }

    return variables;
  }

  // Helper method to resolve nested paths
  private resolvePath(obj: Collection, path: string): unknown {
    const parts = path.split('.');
    let current: Collection | unknown = obj;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined; // Stop if the path doesn't exist
      }

      // Check if the current field is an array (e.g., matchedRequests.docs)
      if (Array.isArray(current)) {
        current = current[0]; // Default to the first element in the array
      }

      if (typeof current !== 'object' || current === null) {
        return undefined; // If we hit a non-object, stop
      }

      // Traverse the object for the current part
      current = (current as Record<string, unknown>)[part];
    }

    // If the final value is still an array, return the first element
    if (Array.isArray(current)) {
      return current[0];
    }

    return current;
  }
}
