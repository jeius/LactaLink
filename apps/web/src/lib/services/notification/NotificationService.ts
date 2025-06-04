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
import _ from 'lodash';
import {
  Field,
  Operation,
  Payload,
  PayloadRequest,
  SanitizedCollectionConfig,
  Where,
} from 'payload';
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
    this.templateProcessor = new TemplateProcessor();
    this.channelFactory = new ChannelFactory(payloadReq.payload);
  }

  async handleTriggers(operation: Operation, doc: Collection, previousDoc?: Collection | null) {
    const collectionSlug = this.collection.slug;

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
    const fullDoc = await this.prepareFullDoc(doc, operation);

    const data = await this.handleTriggers(operation, fullDoc, previousDoc);
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

      this.payload.logger.info(
        notification,
        `Created notification ${notification.id} for ${recipient}`
      );

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
    const collectionSlug = this.collection.slug as 'deliveries' | 'donations' | 'requests';

    if (template.actionUrl && template.actionLabel) {
      return {
        // data: { relationTo: collectionSlug, value: doc.id },
        actionUrl: template.actionUrl.replace('{{id}}', doc.id),
        actionLabel: template.actionLabel,
      };
    }
    return {
      // data: { relationTo: collectionSlug, value: doc.id },
      actionUrl: `/${collectionSlug}/${doc.id}`,
      actionLabel: `View ${this.collection.labels.singular}`,
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
      const value = _.get(doc, path, undefined);

      // Use the resolved value or default
      variables[key] = value !== undefined ? value : defaultValue;
    }

    return variables;
  }

  private async prepareFullDoc(doc: Collection, operation: Operation): Promise<Collection> {
    this.payload.logger.info(doc, `Preparing full document for collection ${this.collection.slug}`);
    // this.payload.logger.info(
    //   this.collection.fields,
    //   `Fields in collection ${this.collection.slug}`
    // );

    if (operation === 'update') {
      const fullDoc = await this.payload.findByID({
        collection: this.collection.slug,
        id: doc.id,
        depth: 2,
        populate: {
          users: { email: true, profile: true, profileType: true, phone: true },
          individuals: { displayName: true, owner: true, addresses: true },
          hospitals: { name: true, addresses: true, owner: true },
          milkBanks: { name: true, addresses: true, owner: true },
          addresses: { displayName: true, owner: true, default: true, name: true },
        },
      });

      this.payload.logger.info(
        fullDoc,
        `Fetched full document for update operation on ${this.collection.slug}`
      );

      return fullDoc;
    }

    // Initialize an empty object to hold the full document
    const fullDoc: Partial<Collection> = {};

    const resolveField = async (
      field: Field,
      parentDoc: Partial<Collection>,
      parentPath: string = ''
    ) => {
      const fieldPath =
        'name' in field && field.name
          ? parentPath
            ? `${parentPath}.${field.name}`
            : field.name
          : parentPath;

      switch (field.type) {
        case 'relationship':
          // Resolve the related document
          if (Array.isArray(field.relationTo)) {
            // Handle multiple relations
            const relatedDocs = await Promise.all(
              field.relationTo.map(async (relation) => {
                return await this.payload.findByID({
                  collection: relation,
                  id: _.get(parentDoc, fieldPath),
                  depth: field.maxDepth || 2,
                });
              })
            );

            // Set the resolved documents in the fullDoc
            _.set(fullDoc, fieldPath, relatedDocs.filter(Boolean));
          } else {
            const relatedDoc = await this.payload.findByID({
              collection: field.relationTo,
              id: _.get(parentDoc, fieldPath),
              depth: field.maxDepth || 2,
            });

            // Set the resolved document in the fullDoc
            _.set(fullDoc, fieldPath, relatedDoc || null);
          }

          break;

        case 'group':
          // Recursively resolve fields in a group or tab
          for (const subField of field.fields) {
            await resolveField(subField, parentDoc, fieldPath);
          }
          break;

        case 'tabs':
          // Recursively resolve fields in a group or tab
          for (const tab of field.tabs) {
            for (const subField of tab.fields) {
              await resolveField(subField, parentDoc, fieldPath);
            }
          }
          break;

        case 'array': {
          // Resolve fields in an array
          const arrayItems = _.get(parentDoc, fieldPath, []);
          const resolvedArray = await Promise.all(
            arrayItems.map(async (item: Collection, index: number) => {
              const resolvedItem: Partial<Collection> = {};
              for (const subField of field.fields) {
                await resolveField(subField, item, `${fieldPath}[${index}]`);
              }
              return resolvedItem;
            })
          );

          // Set the resolved array in the fullDoc
          _.set(fullDoc, fieldPath, resolvedArray);
          break;
        }

        case 'row':
          // Resolve fields in a row
          for (const subField of field.fields) {
            await resolveField(subField, parentDoc, parentPath);
          }
          break;

        default:
          // Copy non-relationship fields directly
          _.set(fullDoc, fieldPath, _.get(parentDoc, fieldPath));
          break;
      }
    };

    // Iterate through all fields in the collection
    for (const field of this.collection.fields) {
      await resolveField(field, doc);
    }

    this.payload.logger.info(
      fullDoc,
      `Resolved full document for collection ${this.collection.slug}`
    );
    return fullDoc as Collection;
  }
}
