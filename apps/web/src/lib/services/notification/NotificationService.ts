import { FieldResolver } from '@/lib/utils/collections/FieldResolver';
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
          'trigger.collection': { equals: collectionSlug },
          'trigger.event': { equals: operation.toUpperCase() },
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
  }

  /**
   * Create a new notification
   * This method validates the notification type, processes templates,
   * builds channel stats, and creates the notification in the database.
   * It also sends the notification immediately if not scheduled for later.
   */
  async autoCreateNotifications({
    doc,
    recipient,
    previousDoc,
    operation,
    extraVariables,
    override,
  }: CreateNotificationParams): Promise<Notification[]> {
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
      const channelsStats = await this.buildChannelStats(this.getDefaultChannels(notificationType));

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

  private async buildChannelStats(
    channelIds: NotificationChannel['id'][],
    scheduledFor?: NotificationChannelStats[number]['scheduledFor']
  ): Promise<NotificationChannelStats> {
    const channels = await this.payload.find({
      collection: 'notification-channels',
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
      depth: 0,
      select: {},
      data: {
        delivery: {
          channelsStats: updatedStats,
        },
      },
    });
  }
}
