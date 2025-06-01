import { Tab } from 'payload';
import { text } from 'payload/shared';

export const configTab: Tab = {
  name: 'configuration',
  label: 'Channel Configuration',
  description: 'Type-specific settings for this notification channel',
  fields: [
    // Webhook and External API configuration
    {
      name: 'endpoint',
      label: 'Endpoint URL',
      type: 'text',
      hasMany: false,
      admin: {
        condition: (data) => ['WEBHOOK', 'EXTERNAL_API'].includes(data.type),
        description: 'API endpoint URL for HTTP POST notifications (must be HTTPS)',
        placeholder: 'https://api.example.com/notifications/webhook',
      },
      validate: (value, args) => {
        if (
          args.data &&
          typeof (args.data as { type?: string }).type === 'string' &&
          ['WEBHOOK', 'EXTERNAL_API'].includes((args.data as { type?: string }).type!) &&
          !value
        ) {
          return 'Endpoint URL is required for webhook and external API channels';
        }
        if (value && !/^https?:\/\/.+/.test(value)) {
          return 'Endpoint must be a valid HTTP/HTTPS URL';
        }
        return text(value, args);
      },
    },

    // API Key for external services
    {
      name: 'apiKey',
      label: 'API Key',
      type: 'text',
      admin: {
        condition: (data) => ['SMS', 'PUSH', 'EXTERNAL_API'].includes(data.type),
        description: 'API key for external service authentication',
        placeholder: 'sk_live_...',
      },
    },

    // Email-specific configuration
    {
      name: 'emailConfig',
      label: 'Email Settings',
      type: 'group',
      admin: {
        condition: (data) => data.type === 'EMAIL',
        description: 'Email-specific settings that override PayloadCMS defaults',
      },
      fields: [
        {
          name: 'fromAddress',
          label: 'From Email Address',
          type: 'text',
          hasMany: false,
          admin: {
            placeholder: 'noreply@lactalink.com',
            description: 'Email address notifications are sent from (optional)',
          },
          validate: (value, args) => {
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return 'Please enter a valid email address';
            }
            return text(value, args);
          },
        },
        {
          name: 'fromName',
          label: 'From Display Name',
          type: 'text',
          admin: {
            placeholder: 'LactaLink',
            description: 'Display name shown to recipients (optional)',
          },
        },
        {
          name: 'replyTo',
          label: 'Reply-To Address',
          type: 'text',
          hasMany: false,
          admin: {
            placeholder: 'support@lactalink.com',
            description: 'Email address for replies (recommended)',
          },
          validate: (value, args) => {
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return 'Please enter a valid email address';
            }
            return text(value, args);
          },
        },
      ],
    },
  ],
};
