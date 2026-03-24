import { createUserField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { NullableValidator } from '@lactalink/agents/payload';
import { MILK_BAG_STATUS } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../../_access-control';
import { adminOrInvolvedParties } from './access';
import { beforeChange } from './hooks/beforeChange';

export const MilkBagEvents: CollectionConfig<'milk-bag-events'> = {
  slug: 'milk-bag-events',
  labels: {
    singular: 'Milk Bag Event',
    plural: 'Milk Bag Events',
  },
  access: {
    admin: admin,
    create: authenticated,
    read: adminOrInvolvedParties,
    update: () => false,
    delete: () => false,
  },
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'id',
    defaultColumns: [],
    hidden: true,
  },
  timestamps: true,
  defaultSort: ['-sequenceNumber', '-occurredAt'],
  indexes: [{ fields: ['milkBag', 'sequenceNumber'], unique: true }],
  hooks: {
    beforeChange: [beforeChange],
  },
  fields: [
    {
      name: 'milkBag',
      type: 'relationship',
      relationTo: 'milkBags',
      required: true,
      index: true,
      admin: {
        description: 'The milk bag associated with this event',
      },
    },

    {
      name: 'eventType',
      type: 'select',
      required: true,
      index: true,
      enumName: 'enum_milk_bag_events_type',
      options: [
        { label: 'Received', value: 'RECEIVED' },
        { label: 'Transferred Out', value: 'TRANSFERRED_OUT' },
        { label: 'Transferred In', value: 'TRANSFERRED_IN' },
        { label: 'Allocated', value: 'ALLOCATED' },
        { label: 'Released', value: 'RELEASED' },
        { label: 'Used', value: 'USED' },
        { label: 'Discarded', value: 'DISCARDED' },
        { label: 'Expired', value: 'EXPIRED' },
        { label: 'Status Changed', value: 'STATUS_CHANGED' },
        { label: 'Corrected', value: 'CORRECTED' },
      ],
    },

    {
      name: 'occurredAt',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'The date and time when the event occurred',
      },
    },

    {
      name: 'organization',
      type: 'relationship',
      relationTo: ['hospitals', 'milkBanks'],
      index: true,
      admin: {
        description: 'The organization associated with this event for non P2P transfers',
      },
    },

    createUserField({
      name: 'performedBy',
      admin: {
        description: 'The user who performed the action that triggered this event',
      },
    }),

    {
      name: 'sequenceNumber',
      type: 'number',
      min: 1,
      required: true,
      index: true,
      validate: NullableValidator.number,
      admin: {
        readOnly: true,
        hidden: true,
        description: 'Auto-incrementing sequence number for events related to the same milk bag',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'select',
          defaultValue: 'USER',
          enumName: 'enum_milk_bag_event_source',
          options: [
            { label: 'User', value: 'USER' },
            { label: 'System', value: 'SYSTEM' },
            { label: 'Import', value: 'IMPORT' },
            { label: 'API', value: 'API' },
          ],
          admin: {
            width: '50%',
            description: 'The source of the event, indicating how it was triggered',
          },
        },

        {
          name: 'isSystemGenerated',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '50%' },
        },
      ],
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Transition',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'fromParty',
                  type: 'relationship',
                  relationTo: ['individuals', 'hospitals', 'milkBanks'],
                  required: true,
                  admin: {
                    description: 'The previous owner of the milk bag',
                    width: '50%',
                  },
                },
                {
                  name: 'toParty',
                  type: 'relationship',
                  relationTo: ['individuals', 'hospitals', 'milkBanks'],
                  required: true,
                  admin: {
                    description: 'The new owner of the milk bag',
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'fromStatus',
                  type: 'select',
                  enumName: 'enum_milk_bag_status',
                  required: true,
                  options: Object.values(MILK_BAG_STATUS),
                },
                {
                  name: 'toStatus',
                  type: 'select',
                  enumName: 'enum_milk_bag_status',
                  required: true,
                  options: Object.values(MILK_BAG_STATUS),
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'fromStorageLabel',
                  type: 'text',
                  admin: { width: '50%' },
                },
                {
                  name: 'toStorageLabel',
                  type: 'text',
                  admin: { width: '50%' },
                },
              ],
            },

            {
              name: 'reason',
              type: 'textarea',
              admin: {
                description:
                  'The reason for the event, especially important for transfers and corrections',
              },
            },
          ],
        },

        {
          label: 'Reference',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'referenceType',
                  type: 'select',
                  enumName: 'enum_milk_bag_events_reference_type',
                  options: [
                    { label: 'Donation', value: 'donations' },
                    { label: 'Transaction', value: 'transactions' },
                    { label: 'Allocation', value: 'allocations' },
                    { label: 'Manual Adjustment', value: 'manual_adjustment' },
                    { label: 'System Job', value: 'system_job' },
                  ],
                },
                {
                  name: 'referenceId',
                  type: 'text',
                },
              ],
            },

            {
              type: 'row',
              fields: [
                {
                  name: 'reversesEvent',
                  type: 'relationship',
                  relationTo: 'milk-bag-events',
                  maxDepth: 1,
                  admin: {
                    description: 'If this event reverses a previous event, link that event here',
                    width: '50%',
                  },
                },
              ],
            },

            {
              name: 'notes',
              type: 'textarea',
              admin: {
                description: 'Additional notes or context about the event',
              },
            },

            {
              name: 'metadata',
              type: 'json',
              admin: {
                description:
                  'Free-form JSON field for storing any additional structured data related to the event',
              },
            },
          ],
        },
      ],
    },
  ],
};
