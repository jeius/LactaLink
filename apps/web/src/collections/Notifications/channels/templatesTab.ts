import { Tab } from 'payload';

export const templatesTab: Tab = {
  name: 'templates',
  label: 'Message Templates',
  description: 'Customize how notifications appear in this channel',
  fields: [
    {
      name: 'subject',
      label: 'Email Subject Template',
      type: 'text',
      admin: {
        condition: ({ type }) => type === 'EMAIL',
        placeholder: 'LactaLink: {{title}}',
        description: 'Subject line with variables: {{title}}, {{recipientName}}, {{priority}}',
      },
    },
    {
      name: 'htmlTemplate',
      label: 'HTML Email Template',
      type: 'textarea',
      admin: {
        condition: ({ type }) => type === 'EMAIL',
        rows: 20,
        description:
          'Raw HTML template with variables. Available: {{title}}, {{message}}, {{recipientName}}, {{actionUrl}}, {{actionLabel}}, {{priority}}',
        placeholder: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb;">
    <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">LactaLink</h1>
    <p style="color: #6b7280; margin: 5px 0 0 0;">Connecting families through milk sharing</p>
  </div>

  <!-- Content -->
  <h2 style="color: #1f2937; margin-bottom: 15px;">{{title}}</h2>
  
  <p style="color: #4b5563; margin-bottom: 15px;">Hi {{recipientName}},</p>
  
  <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">{{message}}</p>

  <!-- Action Button -->
  {{#if actionUrl}}
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{actionUrl}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
      {{actionLabel}}
    </a>
  </div>
  {{/if}}

  <!-- Footer -->
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px;">
      Best regards,<br><strong>The LactaLink Team</strong>
    </p>
  </div>
</div>`,
      },
    },
    {
      name: 'textTemplate',
      label: 'Plain Text Email Template',
      type: 'textarea',
      admin: {
        condition: ({ type }) => type === 'EMAIL',
        rows: 10,
        description: "Plain text fallback for email clients that don't support HTML",
        placeholder: `Hi {{recipientName}},

{{title}}

{{message}}

{{#if actionUrl}}
Take action: {{actionUrl}}
{{/if}}

Best regards,
The LactaLink Team

---
This email was sent by LactaLink. If you have questions, contact support@lactalink.com`,
      },
    },
    {
      name: 'smsTemplate',
      label: 'SMS Message Template',
      type: 'textarea',
      admin: {
        condition: ({ type }) => type === 'SMS',
        rows: 4,
        placeholder: 'LactaLink: {{title}} - {{message}} {{#if actionUrl}}{{actionUrl}}{{/if}}',
        description: 'SMS template (keep concise, ~160 characters max for single SMS)',
      },
    },
  ],
};
