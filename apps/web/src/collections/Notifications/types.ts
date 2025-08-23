import { createdByField } from '@/fields/createdByField';
import { priorityLevel } from '@/fields/priorityLevel';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import {
  COLLECTION_GROUP,
  NOTIFICATION_JS_TYPES,
  NOTIFICATION_TRIGGER_COLLECTION_OPTIONS,
  NOTIFICATION_TRIGGER_EVENT_OPTIONS,
} from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../_access-control';

export const NotificationTypes: CollectionConfig<'notification-types'> = {
  slug: 'notification-types',
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
    defaultColumns: ['name', 'category', 'priority', 'active', 'createdAt'],
  },
  hooks: {
    beforeChange: [generateCreatedBy],
  },
  fields: [
    {
      name: 'active',
      label: 'Active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this notification type is currently active',
        position: 'sidebar',
      },
    },

    {
      name: 'defaultChannels',
      label: 'Default Delivery Channels',
      type: 'relationship',
      relationTo: 'notification-channels',
      hasMany: true,
      admin: {
        description: 'Default channels for this notification type',
        position: 'sidebar',
      },
    },

    createdByField,

    {
      type: 'row',
      fields: [
        {
          name: 'key',
          label: 'Unique Key',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            description: 'Unique identifier for this notification type (e.g., DONATION_MATCHED)',
            width: '50%',
          },
        },
        {
          name: 'name',
          label: 'Display Name',
          type: 'text',
          required: true,
          admin: {
            description: 'Human-readable name for this notification type',
            width: '50%',
          },
        },
      ],
    },

    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of when this notification is triggered',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'category',
          label: 'Category',
          type: 'relationship',
          relationTo: 'notification-categories',
          required: true,
          admin: {
            description: 'Category this notification type belongs to',
            width: '50%',
          },
        },
        priorityLevel({
          name: 'priority',
          label: 'Default Priority Level',
          admin: {
            description: 'Priority level of this notification type',
            width: '50%',
          },
        }),
      ],
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Trigger',
          fields: [
            {
              name: 'trigger',
              label: 'Trigger Conditions',
              interfaceName: 'NotificationTypeTrigger',
              required: true,
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'collection',
                      label: 'Trigger Collection',
                      required: true,
                      type: 'select',
                      enumName: 'enum_notification_trigger_collection',
                      options: Object.values(NOTIFICATION_TRIGGER_COLLECTION_OPTIONS),
                    },
                    {
                      name: 'event',
                      label: 'Trigger Event',
                      required: true,
                      type: 'select',
                      enumName: 'enum_notification_trigger_event',
                      options: Object.values(NOTIFICATION_TRIGGER_EVENT_OPTIONS),
                    },
                  ],
                },
                {
                  name: 'conditions',
                  label: 'Trigger Conditions',
                  type: 'json',
                  admin: {
                    description:
                      'JSON conditions for when to trigger this notification. Use "exists" to check for field existence, "changed" to check for changes, or direct value matches.',
                  },
                },
              ],
            },
          ],
        },

        {
          label: 'Template',
          fields: [
            {
              name: 'template',
              label: 'Notification Template',
              interfaceName: 'NotificationTypeTemplate',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  label: 'Title Template',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Title template with variables like {{volume}}, {{date}}',
                    placeholder: 'Your Request for {{volume}}mL Has Been Matched!',
                  },
                },
                {
                  name: 'message',
                  label: 'Message Template',
                  type: 'textarea',
                  required: true,
                  admin: {
                    description: 'Message template with variables',
                    placeholder:
                      'Great news! Your request for {{volume}}mL of milk has been matched with a donor.',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'actionUrl',
                      label: 'Action URL',
                      type: 'text',
                      admin: {
                        description:
                          'URL to redirect user when they click the notification. Use {{id}} for dynamic IDs.',
                        placeholder: '/requests/{{id}}',
                      },
                    },
                    {
                      name: 'actionLabel',
                      label: 'Action Label',
                      type: 'text',
                      defaultValue: 'View Details',
                      admin: {
                        description: 'Text for the action button in the notification',
                        placeholder: 'View Request',
                      },
                    },
                  ],
                },
                {
                  name: 'variables',
                  label: 'Available Variables',
                  type: 'array',
                  fields: [
                    {
                      name: 'required',
                      label: 'Required',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Whether this variable is required',
                      },
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'key',
                          label: 'Variable Key',
                          type: 'text',
                          required: true,
                          admin: {
                            placeholder: 'volume',
                            description: 'Key for this variable, used in templates like {{volume}}',
                          },
                        },
                        {
                          name: 'type',
                          label: 'Expected Type',
                          required: true,
                          type: 'select',
                          enumName: 'enum_js_types',
                          options: Object.values(NOTIFICATION_JS_TYPES),
                          admin: {
                            description: 'Expected data type for this variable (optional)',
                            placeholder: 'number',
                          },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'path',
                          label: 'Data Path',
                          type: 'text',
                          admin: {
                            description:
                              'Path to the data in the document, e.g. donor.displayName or request.volume. Make sure the path exists in the document and holds the value of the variable.',
                            placeholder: 'request.volume',
                          },
                        },
                        {
                          name: 'defaultValue',
                          label: 'Default Value',
                          type: 'text',
                          admin: {
                            description: 'Default value if not provided (optional)',
                          },
                        },
                      ],
                    },
                    {
                      name: 'description',
                      label: 'Description',
                      type: 'text',
                      admin: {
                        placeholder: 'Volume of milk in mL',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
