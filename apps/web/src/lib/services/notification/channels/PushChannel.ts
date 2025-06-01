import { Notification } from '@lactalink/types';
import { TemplateProcessor } from '../processors';
import { BaseChannel } from './BaseChannel';

export class PushChannel extends BaseChannel {
  private templateProcessor = new TemplateProcessor();

  protected async sendNotification(_notification: Notification): Promise<void> {
    // Implement sending logic here
  }
}
