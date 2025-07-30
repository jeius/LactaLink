import { createdByField } from '@/fields/createdByField';
import { statusTimeStamps } from '@/fields/statusTimeStamps';
import { timeSlotField } from '@/fields/timeSlot';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP, DELIVERY_OPTIONS } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../_access-control';
import { generateTransactionNumber } from './hooks/generateTransactionNumber';

export const Transactions: CollectionConfig<'transactions'> = {
  slug: 'transactions',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: admin,
  },
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'transactionNumber',
    defaultColumns: ['transactionNumber', 'donation', 'request', 'status', 'createdAt'],
  },
  hooks: {
    beforeChange: [generateCreatedBy, generateTransactionNumber],
  },
  fields: [
    {
      name: 'transactionNumber',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Unique transaction identifier',
      },
    },

    createdByField,
    ...statusTimeStamps,

    {
      type: 'row',
      fields: [
        {
          name: 'donation',
          type: 'relationship',
          relationTo: 'donations',
          required: true,
          admin: { width: '50%' },
        },

        {
          name: 'request',
          type: 'relationship',
          relationTo: 'requests',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Transaction Status',
          type: 'select',
          required: true,
          defaultValue: 'MATCHED',
          options: [
            { label: 'Matched', value: 'MATCHED' },
            { label: 'Pending Delivery Confirmation', value: 'PENDING_DELIVERY_CONFIRMATION' },
            { label: 'Delivery Scheduled', value: 'DELIVERY_SCHEDULED' },
            { label: 'In Transit', value: 'IN_TRANSIT' },
            { label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
            { label: 'Delivered', value: 'DELIVERED' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Failed', value: 'FAILED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ],
          admin: { width: '50%' },
        },

        {
          name: 'matchedVolume',
          type: 'number',
          required: true,
          min: 1,
          admin: {
            description: 'Volume of milk being matched (in mL)',
            width: '50%',
          },
        },
      ],
    },

    {
      name: 'matchedBags',
      type: 'relationship',
      relationTo: 'milkBags',
      hasMany: true,
      required: true,
      admin: {
        description: 'Milk bags included in this transaction',
      },
    },

    {
      name: 'transactionType',
      type: 'select',
      required: true,
      defaultValue: 'INDIVIDUAL_TO_INDIVIDUAL',
      options: [
        { label: 'Individual to Individual', value: 'INDIVIDUAL_TO_INDIVIDUAL' },
        { label: 'Individual to Organization', value: 'INDIVIDUAL_TO_ORGANIZATION' },
        { label: 'Organization to Individual', value: 'ORGANIZATION_TO_INDIVIDUAL' },
      ],
      admin: {
        description: 'Type of transaction (determines delivery workflow)',
        position: 'sidebar',
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Delivery Details',
          fields: [
            {
              name: 'delivery',
              type: 'group',
              fields: [
                {
                  name: 'mode',
                  label: 'Delivery Mode',
                  type: 'select',
                  required: true,
                  options: Object.values(DELIVERY_OPTIONS),
                  admin: {
                    condition: (data) => data.transactionType === 'INDIVIDUAL_TO_INDIVIDUAL',
                  },
                },
                {
                  name: 'proposedTimeSlots',
                  label: 'Proposed Time Slots',
                  type: 'array',
                  fields: [
                    {
                      name: 'date',
                      label: 'Proposed Date',
                      type: 'date',
                      required: true,
                    },
                    timeSlotField({
                      label: 'Proposed Time Slot',
                      required: true,
                    }),
                    {
                      name: 'proposedBy',
                      label: 'Proposed By',
                      type: 'select',
                      required: true,
                      options: [
                        { label: 'Donor', value: 'DONOR' },
                        { label: 'Requester', value: 'REQUESTER' },
                      ],
                      admin: { readOnly: true },
                    },
                  ],
                  admin: {
                    condition: (data) =>
                      data.transactionType === 'INDIVIDUAL_TO_INDIVIDUAL' &&
                      data.status === 'PENDING_DELIVERY_CONFIRMATION',
                    description: 'List of proposed date and time slots for negotiation',
                  },
                },
                {
                  name: 'confirmedTimeSlot',
                  label: 'Confirmed Time Slot',
                  type: 'group',
                  fields: [
                    {
                      name: 'date',
                      label: 'Confirmed Date',
                      type: 'date',
                      required: true,
                    },
                    timeSlotField({
                      label: 'Confirmed Time Slot',
                      required: true,
                    }),
                  ],
                  admin: {
                    condition: (data) =>
                      ['DELIVERY_SCHEDULED', 'IN_TRANSIT', 'READY_FOR_PICKUP'].includes(
                        data.status
                      ),
                  },
                },
                {
                  name: 'proposedAddresses',
                  label: 'Proposed Addresses',
                  type: 'array',
                  fields: [
                    {
                      name: 'address',
                      label: 'Proposed Address',
                      type: 'relationship',
                      relationTo: 'addresses',
                      required: true,
                    },
                    {
                      name: 'proposedBy',
                      label: 'Proposed By',
                      type: 'select',
                      required: true,
                      options: [
                        { label: 'Donor', value: 'DONOR' },
                        { label: 'Requester', value: 'REQUESTER' },
                      ],
                      admin: { readOnly: true },
                    },
                  ],
                  admin: {
                    condition: (data) =>
                      data.transactionType === 'INDIVIDUAL_TO_INDIVIDUAL' &&
                      data.status === 'PENDING_DELIVERY_CONFIRMATION',
                  },
                },
                {
                  name: 'confirmedAddress',
                  label: 'Confirmed Address',
                  type: 'relationship',
                  relationTo: 'addresses',
                  admin: {
                    condition: (data) =>
                      [
                        'DELIVERY_SCHEDULED',
                        'IN_TRANSIT',
                        'READY_FOR_PICKUP',
                        'DELIVERED',
                      ].includes(data.status),
                  },
                },
                {
                  name: 'instructions',
                  label: 'Delivery Instructions',
                  type: 'textarea',
                },
              ],
            },
          ],
        },
        {
          label: 'Tracking',
          fields: [
            {
              name: 'tracking',
              label: 'Tracking & Status',
              type: 'group',
              fields: [
                {
                  name: 'deliveredAt',
                  label: 'Delivered At',
                  type: 'date',
                  admin: {
                    condition: (data) => ['DELIVERED', 'COMPLETED'].includes(data.status),
                  },
                },
                {
                  name: 'completedAt',
                  label: 'Completed At',
                  type: 'date',
                  admin: {
                    condition: (data) => data.status === 'COMPLETED',
                  },
                },
                {
                  name: 'failureReason',
                  label: 'Failure Reason',
                  type: 'textarea',
                  admin: {
                    condition: (data) => data.status === 'FAILED',
                  },
                },
                {
                  name: 'statusHistory',
                  label: 'Status History',
                  type: 'array',
                  admin: { readOnly: true },
                  fields: [
                    {
                      name: 'status',
                      type: 'text',
                    },
                    {
                      name: 'timestamp',
                      type: 'date',
                    },
                    {
                      name: 'notes',
                      type: 'textarea',
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
