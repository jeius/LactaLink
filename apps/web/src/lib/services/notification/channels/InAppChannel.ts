import { Notification, User } from '@lactalink/types/payload-generated-types';
import { BaseChannel } from './BaseChannel';

export class InAppChannel extends BaseChannel {
  protected async sendNotification(notification: Notification): Promise<void> {
    // In-app notifications are handled by the database creation and Supabase Realtime
    // No external sending logic is required here.
    console.log(
      `In-app notification created for recipient: ${(notification.recipient as User).email}`
    );

    // Optionally, implement any additional logic needed for in-app notifications
    // such as updating the notification status or triggering UI updates.
  }
}
