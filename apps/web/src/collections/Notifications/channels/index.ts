import { admin, authenticated } from '@/collections/_access-control';
import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP, NOTIFICATION_CHANNEL_TYPE_OPTIONS } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { text } from 'payload/shared';
import { configTab } from './configTab';
import { deliveryTab } from './deliveryTab';
import { templatesTab } from './templatesTab';

/**
 * Notification Channels Collection
 *
 * This collection defines the delivery channels through which notifications can be sent
 * in the LactaLink system. Each channel represents a different method of reaching users
 * with notification content.
 *
 * Channel Types:
 * - IN_APP: Real-time notifications within the application interface
 * - EMAIL: Email notifications via PayloadCMS email adapter (Resend)
 * - SMS: Text message notifications via external SMS providers
 * - PUSH: Push notifications for mobile/web apps
 * - WEBHOOK: HTTP POST to external endpoints for integrations
 * - EXTERNAL_API: Custom API integrations for specialized delivery
 */
export const NotificationChannels: CollectionConfig<'notificationChannels'> = {
  slug: 'notificationChannels',

  access: {
    admin: admin,
    create: admin,
    read: authenticated,
    update: admin,
    delete: admin,
  },

  admin: {
    group: COLLECTION_GROUP.SYSTEM,
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'active', 'createdAt'],
    description:
      'Configure delivery channels for sending notifications through different mediums (email, SMS, push, etc.)',
  },

  hooks: {
    beforeChange: [generateCreatedBy],
  },

  fields: [
    createdByField,

    // Basic Information
    {
      name: 'key',
      label: 'Unique Key',
      type: 'text',
      required: true,
      unique: true,
      hasMany: false,
      admin: {
        description:
          'Unique identifier used in code (e.g., RESEND_EMAIL, TWILIO_SMS, IN_APP_REAL_TIME)',
        placeholder: 'RESEND_EMAIL',
      },
      validate: (value, args) => {
        if (!value) return 'Key is required';
        if (!/^[A-Z][A-Z0-9_]*$/.test(value)) {
          return 'Key must be UPPERCASE letters, numbers, and underscores only';
        }
        return text(value, args);
      },
    },

    {
      name: 'name',
      label: 'Channel Name',
      type: 'text',
      required: true,
      admin: {
        description: 'Human-readable name displayed in admin and user preferences',
        placeholder: 'Email via Resend',
      },
    },

    {
      name: 'type',
      label: 'Channel Type',
      type: 'select',
      enumName: 'enum_notification_channel_type',
      required: true,
      options: NOTIFICATION_CHANNEL_TYPE_OPTIONS,
      admin: {
        description:
          'The delivery method this channel uses. Determines available configuration options.',
      },
    },

    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      admin: {
        description: 'Purpose and configuration notes for this channel',
        placeholder: 'Primary email channel using Resend service for transactional notifications.',
      },
    },

    {
      name: 'active',
      label: 'Channel Active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this channel is currently active and available for notifications',
      },
    },

    {
      type: 'tabs',
      tabs: [configTab, templatesTab, deliveryTab],
    },
  ],
};
