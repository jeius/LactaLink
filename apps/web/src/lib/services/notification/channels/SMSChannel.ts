import { Notification } from '@lactalink/types/payload-generated-types';
import { TemplateProcessor } from '../processors';
import { BaseChannel } from './BaseChannel';

export class SMSChannel extends BaseChannel {
  private templateProcessor = new TemplateProcessor();

  protected async sendNotification(_notification: Notification): Promise<void> {
    // Implement SMS sending logic here
  }
}
