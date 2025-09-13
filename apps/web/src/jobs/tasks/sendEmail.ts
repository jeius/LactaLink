import { extractErrorMessage, extractErrorStatus } from '@lactalink/utilities';
import { APIError, TaskConfig } from 'payload';

export const sendEmailTask: TaskConfig<'send-email'> = {
  slug: 'send-email',
  label: 'Send Email',
  retries: 1,
  interfaceName: 'SendEmailTask',
  inputSchema: [
    { name: 'to', type: 'text', required: true, label: 'Recipient Email' },
    { name: 'subject', type: 'text', required: true, label: 'Email Subject' },
    { name: 'html', type: 'textarea', required: false, label: 'HTML Email Body' },
    { name: 'text', type: 'textarea', required: false, label: 'Plain Text Email Body' },
  ],
  outputSchema: [
    { name: 'message', type: 'text', required: true, label: 'Message' },
    { name: 'sent', type: 'checkbox', required: true, label: 'Sent Successfully' },
  ],
  handler: async ({ input: { to, subject, html, text }, req }) => {
    if (!html && !text) {
      throw new Error('Either html or text content must be provided for the email.');
    }

    req.payload.logger.info(`Sending email to ${to} with subject "${subject}"`);

    let message = `Email sent to ${to} successfully.`;
    let sent = true;

    try {
      await req.payload.sendEmail({
        to,
        subject,
        html,
        text,
      });
    } catch (error) {
      message = `Failed to send email: ${extractErrorMessage(error)}`;
      sent = false;
      req.payload.logger.error(message);
      throw new APIError(message, extractErrorStatus(error), null, true);
    }

    return { output: { message, sent } };
  },
};
