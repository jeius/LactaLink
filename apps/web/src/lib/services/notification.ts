/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Hospital,
  Individual,
  MilkBank,
  Notification,
  NotificationChannel,
  NotificationChannelStats,
  NotificationType,
  User,
} from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { Payload, Where } from 'payload';

export interface CreateNotificationParams {
  recipient: Notification['recipient'];
  typeKey: NotificationType['key'];
  variables?: Record<string, any>;
  relatedData?: NonNullable<Notification['relatedData']>;
  overrides?: {
    priority?: Notification['priority'];
    channels?: NotificationChannel['id'][]; // Array of channel IDs
    scheduledFor?: NotificationChannelStats[number]['scheduledFor'];
    title?: Notification['title']; // Manual override for title
    message?: Notification['message']; // Manual override for message
  };
}

export class NotificationService {
  constructor(private payload: Payload) {}

  /**
   * Create and send a notification
   */
  async createNotification({
    recipient,
    typeKey,
    variables = {},
    relatedData = {},
    overrides = {},
  }: CreateNotificationParams): Promise<Notification> {
    // Get notification type configuration
    const notificationType = await this.getNotificationTypeByKey(typeKey);

    // Process templates with variables (or use overrides)
    const title =
      overrides.title || this.processTemplate(notificationType.template.title, variables);
    const message =
      overrides.message || this.processTemplate(notificationType.template.message, variables);

    // Get channels to use (overrides or defaults from notification type)
    const channelsToUse =
      overrides.channels ||
      notificationType.defaultChannels?.map((channel: string | NotificationChannel) =>
        extractID(channel)
      ) ||
      [];

    // Build channel stats for delivery tracking
    const channelsStats = await this.buildChannelStats(channelsToUse, overrides.scheduledFor);

    // Create notification record
    const notification = await this.payload.create({
      collection: 'notifications',
      data: {
        recipient,
        notificationType: notificationType.id,
        priority: overrides.priority || notificationType.priority,
        title,
        message,
        variables,
        read: false,
        // Related data tab
        relatedData,
        // Delivery tracking
        delivery: { channelsStats },
      },
    });

    // Send notification immediately (unless scheduled)
    if (!overrides.scheduledFor) {
      await this.sendNotification(notification.id);
    }

    return notification;
  }

  /**
   * Get notification type by key with validation
   */
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

  /**
   * Build channel stats array for delivery tracking
   */
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

  /**
   * Process template variables
   */
  private processTemplate(template: string, variables?: Record<string, any>): string {
    if (!variables) return template;

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key]?.toString() || match;
    });
  }

  /**
   * Send notification through all configured channels
   */
  async sendNotification(notificationId: Notification['id']) {
    const notification = await this.payload.findByID({
      collection: 'notifications',
      id: notificationId,
      depth: 3, // Include channels and user data
    });

    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    // Process each channel
    const updatedChannelsStats = await Promise.all(
      notification.delivery.channelsStats.map(
        async (channelStat: NotificationChannelStats[number]) => {
          return await this.sendToChannel(notification, channelStat);
        }
      )
    );

    // Update notification with delivery results
    await this.payload.update({
      collection: 'notifications',
      id: notificationId,
      data: {
        delivery: { channelsStats: updatedChannelsStats },
      },
    });

    return notification;
  }

  /**
   * Send notification to a specific channel
   */
  private async sendToChannel(
    notification: Notification,
    channelStat: NotificationChannelStats[number]
  ): Promise<NotificationChannelStats[number]> {
    const channel = await this.payload.findByID({
      collection: 'notificationChannels',
      id: extractID(channelStat.channel),
      depth: 0, // Include basic channel info
    });

    // Skip if scheduled for future
    if (
      channelStat.scheduled &&
      channelStat.scheduledFor &&
      new Date(channelStat.scheduledFor) > new Date()
    ) {
      return channelStat;
    }

    try {
      channelStat.attempts = (channelStat.attempts ?? 0) + 1;
      channelStat.lastAttemptAt = new Date().toISOString();

      switch (channel.type) {
        case 'EMAIL':
          await this.sendEmail(notification, channel);
          break;
        case 'SMS':
          await this.sendSMS(notification, channel);
          break;
        case 'IN_APP':
          await this.sendInApp(notification, channel);
          break;
        case 'WEBHOOK':
          await this.sendWebhook(notification, channel);
          break;
        case 'PUSH':
          await this.sendPush(notification, channel);
          break;
        default:
          throw new Error(`Unsupported channel type: ${channel.type}`);
      }

      // Mark as sent on success
      channelStat.sent = true;
      channelStat.sentAt = new Date().toISOString();
    } catch (error) {
      channelStat.failureReason = error instanceof Error ? error.message : 'Unknown error';

      // Check if we should retry
      const maxRetries = channel.delivery?.retrySettings?.maxRetries || 3;
      if (channelStat.attempts && channelStat.attempts < maxRetries) {
        // Schedule retry (this would be handled by a background job)
        console.log(
          `Will retry sending to ${channel.name} in ${channel.delivery?.retrySettings?.retryDelay || 5} minutes`
        );
      }
    }

    return channelStat;
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification, channel: NotificationChannel) {
    const recipient = notification.recipient as User;
    const recipientName =
      recipient.profileType === 'INDIVIDUAL'
        ? (recipient.profile?.value as Individual).displayName
        : (recipient.profile?.value as Hospital | MilkBank).name || recipient.email;

    const variables = {
      ...((typeof notification.variables === 'object' && notification.variables) || {}),
      title: notification.title,
      message: notification.message,
      recipientName: recipientName,
      actionUrl: notification.relatedData?.actionUrl,
      actionLabel: notification.relatedData?.actionLabel,
      priority: notification.priority,
    };

    // Process email templates
    const subject = this.processTemplate(channel.templates?.subject || '{{title}}', variables);
    const htmlContent = this.processTemplate(
      channel.templates?.htmlTemplate || '{{message}}',
      variables
    );
    const textContent = this.processTemplate(
      channel.templates?.textTemplate || '{{message}}',
      variables
    );

    // Use PayloadCMS email functionality
    await this.payload.sendEmail({
      to: recipient.email,
      subject,
      html: htmlContent,
      text: textContent,
      from: channel.configuration?.emailConfig?.fromAddress,
      fromName: channel.configuration?.emailConfig?.fromName,
      replyTo: channel.configuration?.emailConfig?.replyTo,
    });
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(notification: Notification, channel: NotificationChannel) {
    const recipient = notification.recipient as User;

    if (!recipient.phone) {
      throw new Error('Recipient phone number not available');
    }

    const recipientName =
      recipient.profileType === 'INDIVIDUAL'
        ? (recipient.profile?.value as Individual).displayName
        : (recipient.profile?.value as Hospital | MilkBank).name || recipient.email;

    const variables = {
      ...((typeof notification.variables === 'object' && notification.variables) || {}),
      title: notification.title,
      message: notification.message,
      recipientName: recipientName,
      actionUrl: notification.relatedData?.actionUrl,
    };

    const smsContent = this.processTemplate(
      channel.templates?.smsTemplate || '{{message}}',
      variables
    );

    // Implement SMS sending logic here (e.g., Twilio)
    console.log(`Sending SMS to ${recipient.phone}: ${smsContent}`);

    // Example implementation would use Twilio SDK or similar
    // await twilioClient.messages.create({
    //   body: smsContent,
    //   to: notification.recipient.phone,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    // });
  }

  /**
   * Send in-app notification
   */
  private async sendInApp(notification: Notification, _: NotificationChannel) {
    // For in-app notifications, the notification record itself serves as the message
    // This could trigger real-time updates via WebSocket, Server-Sent Events, etc.
    console.log(`In-app notification created for user ${extractID(notification.recipient)}`);

    // Example: Trigger WebSocket event
    // this.websocketService.sendToUser(notification.recipient.id, {
    //   type: 'notification',
    //   data: notification,
    // });
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(notification: Notification, channel: NotificationChannel) {
    const payload = {
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        recipient: (notification.recipient as User).email,
        variables: notification.variables,
        actionUrl: notification.relatedData?.actionUrl,
        actionLabel: notification.relatedData?.actionLabel,
      },
      timestamp: new Date().toISOString(),
    };

    if (!channel.configuration || !channel.configuration.endpoint) {
      throw new Error(`Webhook channel ${channel.id} is missing endpoint configuration`);
    }

    if (!channel.configuration.apiKey) {
      throw new Error(`Webhook channel ${channel.id} is missing API key configuration`);
    }

    const response = await fetch(channel.configuration.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(channel.configuration.apiKey && {
          Authorization: `Bearer ${channel.configuration.apiKey}`,
        }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Send push notification
   */
  private async sendPush(notification: Notification, _: NotificationChannel) {
    // Implement push notification logic here
    console.log(`Sending push notification to ${extractID(notification.recipient)}`);

    // Example implementation would use Firebase FCM, OneSignal, etc.
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
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
  async getActiveNotificationTypes(category?: string) {
    const where: Where = { active: { equals: true } };
    if (category) {
      where['category.key'] = { equals: category };
    }

    return await this.payload.find({
      collection: 'notificationTypes',
      where,
      depth: 1,
    });
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
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

  /**
   * Retry failed notifications
   */
  async retryFailedNotifications() {
    const failedNotifications = await this.payload.find({
      collection: 'notifications',
      where: {
        'channelsStats.sent': { equals: false },
        'channelsStats.attempts': { greater_than: 0 },
      },
      pagination: false,
    });

    for (const notification of failedNotifications.docs) {
      try {
        await this.sendNotification(notification.id);
      } catch (error) {
        console.error(`Failed to retry notification ${notification.id}:`, error);
      }
    }

    return failedNotifications.docs.length;
  }
}
