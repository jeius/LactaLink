import { NotificationChannel } from '@lactalink/types';
import { Payload } from 'payload';
import { BaseChannel } from './BaseChannel';
import { EmailChannel } from './EmailChannel';
import { InAppChannel } from './InAppChannel';
import { PushChannel } from './PushChannel';
import { SMSChannel } from './SMSChannel';
import { WebhookChannel } from './WebHookChannel';

/**
 * Factory class for creating notification channel instances.
 * This class abstracts the instantiation of different channel types.
 * It retrieves the channel configuration from the database
 * and creates the appropriate channel class based on the type.
 *
 * @example
 * const channelFactory = new ChannelFactory(payload);
 * const emailChannel = await channelFactory.createChannel('channelId123');
 * * @throws {Error} If the channel type is unsupported.
 */
export class ChannelFactory {
  constructor(private payload: Payload) {}

  /**
   * Creates a channel instance based on the channel type.
   * This method retrieves the channel configuration from the database
   * and instantiates the appropriate channel class.
   *
   * @param {NotificationChannel['id']} channelId - The ID of the notification channel.
   * @returns {Promise<BaseChannel>} - An instance of the appropriate channel class.
   * @throws {Error} If the channel type is unsupported.
   */
  async createChannel(channelId: NotificationChannel['id']): Promise<BaseChannel> {
    const channel = await this.payload.findByID({
      collection: 'notificationChannels',
      id: channelId,
    });

    // Only handle external channels that require "sending"
    switch (channel.type) {
      case 'EMAIL':
        return new EmailChannel(this.payload, channel);
      case 'SMS':
        return new SMSChannel(this.payload, channel);
      case 'WEBHOOK':
        return new WebhookChannel(this.payload, channel);
      case 'PUSH':
        return new PushChannel(this.payload, channel);
      case 'IN_APP':
        return new InAppChannel(this.payload, channel);
      default:
        throw new Error(`Unsupported channel type: ${channel.type}`);
    }
  }

  /**
   * Get channels that require external sending
   */
  async getExternalChannels(
    channelIds: NotificationChannel['id'][]
  ): Promise<NotificationChannel[]> {
    const channels = await this.payload.find({
      collection: 'notificationChannels',
      where: {
        id: { in: channelIds },
        type: { not_equals: 'IN_APP' },
      },
    });

    return channels.docs;
  }
}
