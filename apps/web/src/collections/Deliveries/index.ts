import { createdByField } from '@/fields/createdByField';
import { timeSlotField } from '@/fields/timeSlot';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants';
import { DELIVERY_OPTIONS } from '@lactalink/types/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';

export const Deliveries: CollectionConfig<'deliveries'> = {
  slug: 'deliveries',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: collectionCreatorOrAdmin,
    delete: collectionCreatorOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'request',
    defaultColumns: ['request', 'mode', 'status', 'createdAt'],
  },
  hooks: {
    beforeChange: [generateCreatedBy],
  },
  fields: [
    createdByField,
    {
      name: 'request',
      type: 'relationship',
      relationTo: 'requests',
      required: true,
      admin: {
        description: 'The request this delivery is for',
      },
    },
    {
      name: 'donation',
      type: 'relationship',
      relationTo: 'donations',
      required: true,
      admin: {
        description: 'The donation being delivered',
      },
    },
    {
      name: 'mode',
      label: 'Delivery Mode',
      type: 'select',
      required: true,
      options: Object.values(DELIVERY_OPTIONS),
    },
    {
      name: 'status',
      label: 'Delivery Status',
      type: 'select',
      required: true,
      defaultValue: 'PENDING',
      options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Pending Confirmation', value: 'PENDING_CONFIRMATION' },
        { label: 'Confirmed', value: 'CONFIRMED' },
        { label: 'Scheduled', value: 'SCHEDULED' },
        { label: 'In Transit', value: 'IN_TRANSIT' },
        { label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
        { label: 'Delivered', value: 'DELIVERED' },
        { label: 'Failed', value: 'FAILED' },
        { label: 'Cancelled', value: 'CANCELLED' },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            {
              name: 'details',
              label: 'Delivery Details',
              type: 'group',
              fields: [
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
                      admin: {
                        description: 'Proposed date for the delivery, pickup, or meetup',
                      },
                    },
                    timeSlotField({
                      label: 'Proposed Time Slot',
                      required: true,
                      description: 'Proposed time slot for the delivery, pickup, or meetup',
                    }),
                    {
                      name: 'proposedBy',
                      label: 'Proposed By',
                      type: 'select',
                      enumName: 'enum_proposedBy',
                      required: true,
                      options: [
                        { label: 'Donor', value: 'DONOR' },
                        { label: 'Requester', value: 'REQUESTER' },
                      ],
                      admin: {
                        readOnly: true,
                        description: 'Indicates who proposed this time slot',
                      },
                    },
                  ],
                  admin: {
                    condition: (data) => data.status === 'PENDING_CONFIRMATION',
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
                      admin: {
                        description: 'The confirmed date for the delivery, pickup, or meetup',
                      },
                    },
                    timeSlotField({
                      label: 'Confirmed Time Slot',
                      required: true,
                      description: 'The confirmed time slot for the delivery, pickup, or meetup',
                    }),
                  ],
                  admin: {
                    condition: (data) => ['CONFIRMED', 'SCHEDULED'].includes(data.status),
                    description:
                      'The confirmed date and time slot for the delivery, pickup, or meetup',
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
                      enumName: 'enum_proposedBy',
                      options: [
                        { label: 'Donor', value: 'DONOR' },
                        { label: 'Requester', value: 'REQUESTER' },
                      ],
                      admin: {
                        readOnly: true,
                        description: 'Indicates who proposed this address',
                      },
                    },
                  ],
                  admin: {
                    description: 'List of proposed addresses for negotiation',
                    condition: (data) => data.status === 'PENDING_CONFIRMATION',
                  },
                },
                {
                  name: 'confirmedAddress',
                  label: 'Confirmed Address',
                  type: 'relationship',
                  relationTo: 'addresses',
                  required: true,
                  admin: {
                    description: 'The confirmed address for the delivery, pickup, or meetup',
                  },
                },
                {
                  name: 'instructions',
                  label: 'Instructions',
                  type: 'textarea',
                  admin: {
                    description:
                      'Special instructions for pickup, delivery, or meetup (e.g., gate code, contact person)',
                  },
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
                    condition: (data) => data.status === 'DELIVERED',
                  },
                },
                {
                  name: 'failureReason',
                  label: 'Failure Reason',
                  type: 'textarea',
                  admin: {
                    condition: (data) => data.status === 'FAILED',
                    description: 'Reason why the delivery failed',
                  },
                },
                {
                  name: 'trackingHistory',
                  label: 'Status History',
                  type: 'array',
                  admin: {
                    readOnly: true,
                  },
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
