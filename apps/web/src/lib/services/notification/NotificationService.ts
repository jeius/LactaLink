import { FieldResolver } from '@/lib/utils/collections/FieldResolver';
import { NOTIFICATION_CHANNEL_TYPE_OPTIONS, PRIORITY_LEVELS } from '@lactalink/enums';
import {
  Collection,
  Notification,
  NotificationChannel,
  NotificationChannelStats,
  NotificationType,
} from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { Operation, Payload, PayloadRequest, SanitizedCollectionConfig } from 'payload';
import { ChannelFactory } from './channels';
import { TemplateProcessor } from './processors';
import { AutoCreateNotificationParams, CreateNotificationParams } from './types';
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

  /**
   * Automatically create notifications based on triggers defined in notification types.
   * This method validates triggers, processes templates, and sends notifications through appropriate channels.
   * @param AutoCreateNotificationParams parameters for auto creating notifications
   * @returns Array of created notifications
   */
  async autoCreateNotifications({
    doc,
    recipient,
    previousDoc,
    operation,
    extraVariables,
    override,
  }: AutoCreateNotificationParams): Promise<Notification[]> {
    try {
      const data = await this.handleTriggers(operation, doc, previousDoc);

      if (data.length === 0) {
        this.payload.logger.info(
          `No notification types matched for ${operation.toUpperCase()} operation on ${this.collection.slug}`
        );
        return [];
      }

      const notifications: Notification[] = [];

      for (const { notificationType, relatedData, variables } of data) {
        const allVariables = { ...variables, ...extraVariables };

        // Only validate variables if not overriding title/message
        if (!override) {
          this.templateValidator.validate(notificationType, allVariables);
        }

        // Process templates
        const title =
          override?.title ||
          this.templateProcessor.process(notificationType.template.title, allVariables);
        const message =
          override?.message ||
          this.templateProcessor.process(notificationType.template.message, allVariables);
        const priority = override?.priority || notificationType.priority;

        // Build channel stats
        const channelsStats = this.buildChannelStats(this.getDefaultChannels(notificationType));

        // Create notification
        const notification = await this.payload.create({
          collection: 'notifications',
          depth: 3,
          req: this.payloadReq,
          data: {
            recipient,
            priority,
            title,
            message,
            variables: allVariables,
            read: false,
            relatedData,
            notificationType: notificationType.id,
            notificationCategory: extractID(notificationType.category),
            delivery: { channelsStats },
          },
        });

        await this.sendNotification(notification);
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      this.payload.logger.error('Error auto creating notifications:', error);
      throw error;
    }
  }

  /**
   * Create a notification with specified parameters and send it through appropriate channels.
   * @param CreateNotificationParams parameters for creating a notification
   * @returns The created notification
   */
  async createNotification({
    scheduleDelivery,
    categoryKey,
    relatedDoc,
    ...params
  }: CreateNotificationParams): Promise<Notification> {
    // Build channel stats
    const getChannelStats = async () => {
      const channels = await this.getChannelByPriority(
        params.priority || PRIORITY_LEVELS.LOW.value
      );
      return this.buildChannelStats(extractID(channels), scheduleDelivery?.toISOString());
    };

    const getCategory = async () => {
      const { docs: categories } = await this.payload.find({
        collection: 'notification-categories',
        req: this.payloadReq,
        depth: 0,
        pagination: false,
      });

      if (!categories.length) {
        throw new Error(
          'No notification categories found. Please create one before sending notifications.'
        );
      }

      return categories.find((c) => c.key === categoryKey) || categories[0]!;
    };

    const [channelsStats, notificationCategory] = await Promise.all([
      getChannelStats(),
      getCategory(),
    ]).catch((err) => {
      this.payload.logger.error('Error creating notification:', err);
      throw err;
    });

    const slugLabel = this.collection.labels.singular;
    const actionLabel = `View ${slugLabel}`;
    const actionUrl = relatedDoc
      ? `/${relatedDoc.relationTo}/${extractID(relatedDoc.value)}`
      : null;

    // Create notification
    const notification = await this.payload.create({
      collection: 'notifications',
      depth: 3,
      req: this.payloadReq,
      data: {
        ...params,
        priority: params.priority || PRIORITY_LEVELS.LOW.value,
        recipient: extractID(params.recipient),
        notificationCategory: extractID(notificationCategory),
        delivery: { channelsStats },
        relatedData: {
          data: relatedDoc,
          actionLabel,
          actionUrl,
        },
      },
    });

    await this.sendNotification(notification);

    return notification;
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

  handleTriggers = async (
    operation: Operation,
    doc: Collection,
    previousDoc?: Collection | null
  ) => {
    const collectionSlug = this.collection.slug;
    const resolver = new FieldResolver(this.collection);

    const [fullDoc, notificationTypes] = await Promise.all([
      this.payload.findByID({
        collection: collectionSlug,
        req: this.payloadReq,
        id: doc.id,
        depth: 5,
      }),
      this.payload.find({
        collection: 'notification-types',
        req: this.payloadReq,
        where: {
          and: [
            { 'trigger.collection': { equals: collectionSlug } },
            { 'trigger.event': { equals: operation.toUpperCase() } },
            { active: { equals: true } },
          ],
        },
      }),
    ]);

    const resolvedData: {
      relatedData: NonNullable<Notification['relatedData']>;
      variables: Record<string, unknown>;
      notificationType: NotificationType;
    }[] = [];

    for (const notificationType of notificationTypes.docs) {
      const trigger = notificationType.trigger;
      const trigValidator = new TriggerValidator(trigger, doc, previousDoc);

      if (trigValidator.validate(this.collection.flattenedFields, this.payloadReq)) {
        resolvedData.push({
          relatedData: resolver.resolveRelatedData(notificationType, fullDoc),
          variables: resolver.resolveVariables(notificationType, fullDoc),
          notificationType: notificationType,
        });
      }
    }

    return resolvedData;
  };

  private buildChannelStats = (
    channelIDs: NotificationChannel['id'][],
    scheduledFor?: NotificationChannelStats[number]['scheduledFor']
  ): NotificationChannelStats => {
    return channelIDs.map((id) => ({
      channel: id,
      scheduled: !!scheduledFor,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      sent: false,
      attempts: 0,
    }));
  };

  private getDefaultChannels = (
    notificationType: NotificationType
  ): NotificationChannel['id'][] => {
    if (!notificationType.defaultChannels || !notificationType.defaultChannels.length) {
      throw new Error(`Notification type ${notificationType.key} has no default channels defined`);
    }

    const channels = notificationType.defaultChannels.map((channel) => extractID(channel));
    return channels;
  };

  private getChannelByPriority = async (
    priority: NonNullable<Notification['priority']>
  ): Promise<NotificationChannel[]> => {
    const { docs: channels } = await this.payloadReq.payload.find({
      collection: 'notification-channels',
      req: this.payloadReq,
      where: { active: { equals: true } },
      pagination: false,
      depth: 0,
    });

    const keys = NOTIFICATION_CHANNEL_TYPE_OPTIONS;

    const channelMap = {
      IN_APP: channels.find((c) => c.key === keys.IN_APP.value),
      EMAIL: channels.find((c) => c.key === keys.EMAIL.value),
      SMS: channels.find((c) => c.key === keys.SMS.value),
      PUSH: channels.find((c) => c.key === keys.PUSH.value),
    };

    let defaultChannels = Object.values(channelMap);

    if (priority === PRIORITY_LEVELS.LOW.value) {
      defaultChannels = [channelMap.IN_APP];
    } else if (priority === PRIORITY_LEVELS.MEDIUM.value) {
      defaultChannels = [channelMap.IN_APP, channelMap.EMAIL];
    }

    return defaultChannels.filter((v) => v !== undefined);
  };

  private updateDeliveryStats = async (
    notificationId: Notification['id'],
    updatedStats: NotificationChannelStats
  ): Promise<void> => {
    await this.payload.update({
      collection: 'notifications',
      id: notificationId,
      req: this.payloadReq,
      depth: 0,
      select: {},
      data: {
        delivery: {
          channelsStats: updatedStats,
        },
      },
    });
  };
}
