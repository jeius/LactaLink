import { Tab } from 'payload';

export const deliveryTab: Tab = {
  name: 'delivery',
  label: 'Delivery Settings',
  description: 'Configure retry behavior and delivery preferences',
  fields: [
    {
      name: 'retrySettings',
      label: 'Retry Configuration',
      type: 'group',
      admin: {
        description: 'Automatic retry behavior for failed deliveries',
      },
      fields: [
        {
          name: 'maxRetries',
          label: 'Maximum Retry Attempts',
          type: 'number',
          defaultValue: 3,
          min: 0,
          max: 10,
          admin: {
            description: 'Number of times to retry failed deliveries (0 = no retries)',
          },
        },
        {
          name: 'retryDelay',
          label: 'Retry Delay (minutes)',
          type: 'number',
          defaultValue: 5,
          min: 1,
          max: 1440, // 24 hours
          admin: {
            description: 'Minutes to wait between retry attempts',
          },
        },
      ],
    },

    {
      name: 'metadata',
      label: 'Advanced Settings',
      type: 'group',
      admin: {
        description: 'Additional settings for channel management',
      },
      fields: [
        {
          name: 'priority',
          label: 'Channel Priority',
          type: 'number',
          defaultValue: 1,
          min: 1,
          max: 10,
          admin: {
            description:
              'Priority when multiple channels of same type exist (lower = higher priority)',
          },
        },
        {
          name: 'rateLimitPerHour',
          label: 'Rate Limit (per hour)',
          type: 'number',
          min: 1,
          admin: {
            description: 'Maximum notifications per hour (leave empty for no limit)',
            placeholder: '1000',
          },
        },
        {
          name: 'tags',
          label: 'Channel Tags',
          type: 'text',
          admin: {
            description:
              'Comma-separated tags for organization (e.g., production, urgent, marketing)',
            placeholder: 'production, transactional, high-priority',
          },
        },
      ],
    },
  ],
};
