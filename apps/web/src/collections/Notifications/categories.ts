import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP, SYSTEM_COLORS } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { text } from 'payload/shared';
import { admin, authenticated } from '../_access-control';

/**
 * Notification Categories Collection
 *
 * This collection defines categories for organizing notification types in the LactaLink system.
 * Categories help group related notifications and provide consistent UI styling and behavior.
 *
 * Examples:
 * - MATCHING: Notifications about donation/request matching
 * - DELIVERY: Notifications about delivery status updates
 * - SYSTEM: System alerts and maintenance notifications
 * - REMINDERS: Scheduled reminder notifications
 *
 * Each category includes:
 * - Visual styling (color, icon) for consistent UI presentation
 * - Logical grouping for admin management
 * - Enable/disable functionality for bulk control
 */
export const NotificationCategories: CollectionConfig<'notificationCategories'> = {
  slug: 'notificationCategories',

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
    defaultColumns: ['name', 'key', 'color', 'active', 'createdAt'],
    description:
      'Organize notification types into logical categories with consistent styling and behavior.',
  },

  hooks: {
    beforeChange: [generateCreatedBy],
  },

  fields: [
    createdByField,

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Category Details',
          fields: [
            {
              name: 'key',
              label: 'Unique Key',
              type: 'text',
              required: true,
              unique: true,
              hasMany: false,
              admin: {
                description:
                  'Unique identifier used in code to reference this category. Use UPPERCASE with underscores (e.g., MATCHING, DELIVERY_STATUS, SYSTEM_ALERTS)',
                placeholder: 'MATCHING',
              },
              validate: (value, args) => {
                if (!value) {
                  return 'Key is required';
                }
                if (!/^[A-Z][A-Z0-9_]*$/.test(value)) {
                  return 'Key must be UPPERCASE letters, numbers, and underscores only, starting with a letter';
                }
                return text(value, args);
              },
            },

            {
              name: 'name',
              label: 'Display Name',
              type: 'text',
              required: true,
              admin: {
                description:
                  'Human-readable name displayed in the admin interface and potentially in user-facing UI',
                placeholder: 'Matching & Pairing',
              },
            },

            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              admin: {
                description:
                  'Detailed description of what types of notifications belong to this category. Helps admins understand when to use this category.',
                placeholder:
                  'Notifications related to matching donations with requests, including successful matches, matching failures, and match confirmations.',
              },
            },

            {
              name: 'icon',
              label: 'Icon Identifier',
              type: 'text',
              admin: {
                description:
                  'Icon name for the notification icon. Only supports icon names from Lucide.dev as of the current version. Please refer to the Lucide.dev documentation for available icons.',
                placeholder: 'handshake',
                condition: (data) => data.active !== false,
              },
            },

            {
              type: 'row',
              fields: [
                {
                  name: 'color',
                  label: 'Notification Color',
                  type: 'select',
                  enumName: 'enum_system_colors',
                  options: Object.values(SYSTEM_COLORS),
                  defaultValue: SYSTEM_COLORS.DEFAULT.value,
                  hasMany: false,
                  admin: {
                    width: '50%',
                    description:
                      'Color used for notifications in this category. Applies to icons, headers, and highlights in the UI.',
                    placeholder: 'Select a color',
                    condition: (data) => data.active !== false,
                  },
                },
                {
                  name: 'sortOrder',
                  label: 'Display Order',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    width: '50%',
                    description:
                      'Controls the order categories appear in lists and dropdowns. Lower numbers appear first.',
                    step: 1,
                  },
                },
              ],
            },

            {
              name: 'active',
              label: 'Active',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Whether this category is currently active. Inactive categories cannot be assigned to new notification types but existing notifications remain unchanged.',
              },
            },
          ],
        },

        {
          label: 'Metadata',
          fields: [
            // Metadata for analytics and management
            {
              name: 'metadata',
              label: 'Category Metadata',
              type: 'group',
              admin: {
                description: 'Additional settings and information for this category',
                position: 'sidebar',
              },
              fields: [
                {
                  name: 'allowUserSettings',
                  label: 'Allow User Preferences',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description:
                      'Whether users can customize notification preferences for this category (e.g., enable/disable, choose delivery channels)',
                  },
                },
                {
                  name: 'retentionDays',
                  label: 'Retention Period (Days)',
                  type: 'number',
                  defaultValue: 30,
                  min: 1,
                  max: 365,
                  admin: {
                    description:
                      'How long notifications in this category should be kept before automatic cleanup. System notifications may have longer retention.',
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
