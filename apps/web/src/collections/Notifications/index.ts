import { createdByField } from '@/fields/createdByField';
import { priorityLevel } from '@/fields/priorityLevel';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP, NOTIFICATION_TRIGGER_COLLECTION_OPTIONS } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';

/**
 * Notifications Collection
 *
 * This collection stores individual notification instances sent to users in the LactaLink system.
 * Each notification represents a processed message that has been generated from a notification type
 * template and is being delivered (or has been delivered) through various channels.
 *
 * Key Features:
 * - Template Processing: Contains final processed content from notification type templates
 * - Multi-Channel Delivery: Tracks delivery status across multiple channels (email, SMS, in-app, etc.)
 * - Read Tracking: Monitors when users read notifications
 * - Action Support: Can include buttons/links for user actions
 * - Related Data: Links to relevant system entities (donations, requests, deliveries)
 * - Retry Logic: Supports automatic retry for failed deliveries
 *
 * Lifecycle:
 * 1. Created by NotificationService when events occur
 * 2. Content processed from notification type templates with actual variables
 * 3. Queued for delivery across configured channels
 * 4. Delivery status tracked per channel
 * 5. User interaction tracked (read status, action clicks)
 */
export const Notifications: CollectionConfig<'notifications'> = {
  slug: 'notifications',

  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: collectionCreatorOrAdmin,
    delete: collectionCreatorOrAdmin,
  },

  admin: {
    group: COLLECTION_GROUP.SYSTEM,
    useAsTitle: 'title',
    defaultColumns: ['recipient', 'notificationType', 'title', 'priority', 'read', 'createdAt'],
    description:
      'Individual notification instances with delivery tracking and user interaction data',
  },

  hooks: {
    beforeChange: [generateCreatedBy],
  },

  fields: [
    createdByField,

    // Core Notification Data
    {
      name: 'recipient',
      label: 'Recipient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description:
          'User who will receive this notification. Determines delivery preferences and contact methods.',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'notificationCategory',
          label: 'Notification Category',
          type: 'relationship',
          relationTo: 'notification-categories',
          required: true,
          admin: {
            description: 'Category of this notification. Used for user preferences and filtering.',
          },
        },
        {
          name: 'notificationType',
          label: 'Notification Type',
          type: 'relationship',
          relationTo: 'notification-types',
          required: false,
          admin: {
            description:
              'Template and configuration used to generate this notification. Defines priority, and default channels.',
          },
        },
      ],
    },

    priorityLevel({
      required: false,
      label: 'Priority Level',
      admin: {
        description:
          'Overrides the default priority from notification type. Affects delivery urgency and user interface prominence.',
      },
    }),

    // Processed Content (Auto-Generated from Templates)
    {
      name: 'title',
      label: 'Notification Title',
      type: 'text',
      required: true,
      admin: {
        description:
          'Final processed title from notification type template with variables replaced. This is null if notificationType is not provided.',
        readOnly: true,
      },
    },

    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Final processed message content from template with variables replaced. This is null if notificationType is not provided.',
        readOnly: true,
      },
    },

    {
      name: 'variables',
      label: 'Template Variables',
      type: 'json',
      admin: {
        description:
          'Key-value pairs of variables used to process the notification templates. Stored for audit trail and debugging purposes.',
        readOnly: true,
      },
    },

    // User Interaction Tracking
    {
      name: 'read',
      label: 'Read Status',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Whether the recipient has marked this notification as read. Updates automatically when user views notification.',
      },
    },

    {
      name: 'readAt',
      label: 'Read At',
      type: 'date',
      admin: {
        condition: (data) => data.read === true,
        description: 'Timestamp when the notification was marked as read by the recipient.',
        readOnly: true,
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          name: 'relatedData',
          label: 'Related Data',
          description: 'Links to system entities and action buttons for this notification',
          fields: [
            {
              name: 'data',
              label: 'Related Entity',
              type: 'relationship',
              relationTo: Object.values(NOTIFICATION_TRIGGER_COLLECTION_OPTIONS).map(
                (option) => option.value
              ),
              maxDepth: 2,
              admin: {
                description:
                  'System entity that triggered this notification (e.g., matched donation, completed delivery). Used for context and navigation.',
              },
            },
            {
              name: 'actionUrl',
              label: 'Action URL',
              type: 'text',
              admin: {
                placeholder: '/app/transactions/123',
                description:
                  'URL for the primary action button in the notification. Typically links to relevant page in the app.',
              },
            },
            {
              name: 'actionLabel',
              label: 'Action Button Label',
              type: 'text',
              admin: {
                placeholder: 'View Delivery Details',
                description:
                  'Text displayed on the action button. Should clearly indicate what the action does.',
              },
            },
          ],
        },

        {
          name: 'delivery',
          label: 'Delivery Status',
          description: 'Multi-channel delivery tracking and retry management',
          fields: [
            {
              name: 'channelsStats',
              label: 'Channel Delivery Status',
              type: 'array',
              required: true,
              interfaceName: 'NotificationChannelStats',
              admin: {
                description:
                  'Delivery status for each notification channel (email, SMS, in-app, etc.). Tracks attempts, failures, and success.',
              },
              fields: [
                {
                  name: 'channel',
                  label: 'Notification Channel',
                  type: 'relationship',
                  relationTo: 'notification-channels',
                  required: true,
                  admin: {
                    description:
                      'Delivery method for this notification (e.g., email via Resend, SMS via Twilio, in-app display).',
                  },
                },

                // Scheduling
                {
                  name: 'scheduled',
                  label: 'Scheduled',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description:
                      'Whether this notification is scheduled for future delivery rather than immediate sending.',
                  },
                },
                {
                  name: 'scheduledFor',
                  label: 'Scheduled For',
                  type: 'date',
                  admin: {
                    condition: (_, { scheduled }) => scheduled === true,
                    description:
                      'Future date/time when this notification should be sent via this channel.',
                  },
                },

                // Delivery Status
                {
                  name: 'sent',
                  label: 'Successfully Sent',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description:
                      'Whether the notification was successfully delivered via this channel.',
                  },
                },
                {
                  name: 'sentAt',
                  label: 'Sent At',
                  type: 'date',
                  admin: {
                    condition: (_, { sent }) => sent === true,
                    description:
                      'Timestamp when the notification was successfully sent via this channel.',
                    readOnly: true,
                  },
                },

                // Retry Tracking
                {
                  name: 'attempts',
                  label: 'Delivery Attempts',
                  type: 'number',
                  defaultValue: 0,
                  min: 0,
                  admin: {
                    description:
                      'Number of times delivery has been attempted via this channel. Includes both successful and failed attempts.',
                    readOnly: true,
                  },
                },
                {
                  name: 'lastAttemptAt',
                  label: 'Last Attempt At',
                  type: 'date',
                  admin: {
                    condition: (_, { attempts }) => attempts > 0,
                    description: 'Timestamp of the most recent delivery attempt via this channel.',
                    readOnly: true,
                  },
                },
                {
                  name: 'failureReason',
                  label: 'Failure Reason',
                  type: 'textarea',
                  admin: {
                    condition: (_, { attempts, sent }) => attempts > 0 && !sent,
                    description:
                      'Detailed error message explaining why delivery failed. Used for troubleshooting and retry logic.',
                    readOnly: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
