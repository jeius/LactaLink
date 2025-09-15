import {
  Hospital,
  Individual,
  MilkBank,
  Notification,
  User,
} from '@lactalink/types/payload-generated-types';
import { TemplateProcessor } from '../processors';
import { BaseChannel } from './BaseChannel';

export class EmailChannel extends BaseChannel {
  private templateProcessor = new TemplateProcessor();

  protected async sendNotification(notification: Notification): Promise<void> {
    const recipient = notification.recipient as User;
    const variables = this.buildEmailVariables(notification, recipient);

    const subject = this.templateProcessor.process(
      this.channel.templates?.subject || '{{title}}',
      variables
    );
    const htmlContent = this.templateProcessor.process(
      this.channel.templates?.htmlTemplate || '{{message}}',
      variables
    );
    const textContent = this.templateProcessor.process(
      this.channel.templates?.textTemplate || '{{message}}',
      variables
    );

    await this.payload.sendEmail({
      to: recipient.email,
      subject,
      html: htmlContent,
      text: textContent,
      from: this.channel.configuration?.emailConfig?.fromAddress,
      fromName: this.channel.configuration?.emailConfig?.fromName,
      replyTo: this.channel.configuration?.emailConfig?.replyTo,
    });
  }

  private buildEmailVariables(notification: Notification, recipient: User) {
    const recipientName = this.getRecipientName(recipient);

    return {
      ...((typeof notification.variables === 'object' && notification.variables) || {}),
      title: notification.title,
      message: notification.message,
      recipientName,
      actionUrl: notification.relatedData?.actionUrl,
      actionLabel: notification.relatedData?.actionLabel,
      priority: notification.priority,
    };
  }

  private getRecipientName(recipient: User): string {
    return recipient.profileType === 'INDIVIDUAL'
      ? (recipient.profile?.value as Individual).displayName!
      : (recipient.profile?.value as Hospital | MilkBank).name || recipient.email;
  }
}
