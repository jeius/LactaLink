import { createdByField } from '@/fields/createdByField';
import { priorityLevel } from '@/fields/priorityLevel';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import {
  COLLECTION_GROUP,
  NOTIFICATION_TRIGGER_COLLECTION_OPTIONS,
  NOTIFICATION_TRIGGER_EVENT_OPTIONS,
} from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../_access-control';

export const NotificationTypes: CollectionConfig<'notificationTypes'> = {
  slug: 'notificationTypes',
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
    createdByField,
    {
      name: 'key',
      label: 'Unique Key',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for this notification type (e.g., DONATION_MATCHED)',
      },
    },
    {
      name: 'name',
      label: 'Display Name',
      type: 'text',
      required: true,
      admin: {
        description: 'Human-readable name for this notification type',
      },
    },
    {
      name: 'category',
      label: 'Category',
      type: 'relationship',
      relationTo: 'notificationCategories',
      required: true,
      admin: {
        description: 'Category this notification type belongs to',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of when this notification is triggered',
      },
    },
    priorityLevel({
      name: 'priority',
      label: 'Default Priority Level',
      admin: {
        description: 'Priority level of this notification type',
      },
    }),
    {
      name: 'template',
      label: 'Message Template',
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
          name: 'variables',
          label: 'Available Variables',
          type: 'array',
          fields: [
            {
              name: 'key',
              label: 'Variable Key',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'volume',
              },
            },
            {
              name: 'description',
              label: 'Description',
              type: 'text',
              admin: {
                placeholder: 'Volume of milk in mL',
              },
            },
            {
              name: 'type',
              label: 'Expected Type',
              type: 'select',
              enumName: 'enum_js_types',
              options: [
                { label: 'String', value: 'string' },
                { label: 'Number', value: 'number' },
                { label: 'Boolean', value: 'boolean' },
                { label: 'Date', value: 'date' },
                { label: 'Array', value: 'array' },
                { label: 'Object', value: 'object' },
              ],
              admin: {
                description: 'Expected data type for this variable (optional)',
              },
            },
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
              name: 'defaultValue',
              label: 'Default Value',
              type: 'text',
              admin: {
                description: 'Default value if not provided (optional)',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'defaultChannels',
      label: 'Default Delivery Channels',
      type: 'relationship',
      relationTo: 'notificationChannels',
      hasMany: true,
      admin: {
        description: 'Default channels for this notification type',
      },
    },
    {
      name: 'triggers',
      label: 'Trigger Conditions',
      interfaceName: 'NotificationTypeTrigger',
      type: 'group',
      fields: [
        {
          name: 'collection',
          label: 'Trigger Collection',
          type: 'select',
          enumName: 'enum_notification_trigger_collection',
          options: NOTIFICATION_TRIGGER_COLLECTION_OPTIONS,
        },
        {
          name: 'event',
          label: 'Trigger Event',
          type: 'select',
          enumName: 'enum_notification_trigger_event',
          options: NOTIFICATION_TRIGGER_EVENT_OPTIONS,
        },
        {
          name: 'conditions',
          label: 'Trigger Conditions',
          type: 'json',
          admin: {
            description: 'JSON conditions for when to trigger this notification',
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
        description: 'Whether this notification type is currently active',
      },
    },
  ],
};
