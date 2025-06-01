import { createdByField } from '@/fields/createdByField';
import { timeSlotField } from '@/fields/timeSlot';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP, DELIVERY_OPTIONS } from '@/lib/constants';
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
          name: 'pickupDetails',
          label: 'Pickup Details',
          admin: {
            condition: (data) => data.mode === 'PICKUP',
          },
          fields: [
            {
              name: 'address',
              label: 'Pickup Address',
              type: 'relationship',
              relationTo: 'addresses',
              required: true,
            },
            {
              name: 'date',
              label: 'Pickup Date',
              type: 'date',
              admin: {
                condition: (data) =>
                  ['SCHEDULED', 'IN_TRANSIT', 'READY_FOR_PICKUP'].includes(data.status),
              },
            },
            timeSlotField({
              condition: (data) =>
                ['SCHEDULED', 'IN_TRANSIT', 'READY_FOR_PICKUP'].includes(data.status),
            }),
            {
              name: 'instructions',
              label: 'Pickup Instructions',
              type: 'textarea',
              admin: {
                description: 'Special instructions for pickup (e.g., gate code, contact person)',
              },
            },
          ],
        },
        {
          name: 'deliveryDetails',
          label: 'Delivery Details',
          admin: {
            condition: (data) => data.mode === 'DELIVERY',
          },
          fields: [
            {
              name: 'address',
              label: 'Delivery Address',
              type: 'relationship',
              relationTo: 'addresses',
              required: true,
            },
            {
              name: 'date',
              label: 'Delivery Date',
              type: 'date',
              admin: {
                condition: (data) => ['SCHEDULED', 'IN_TRANSIT'].includes(data.status),
              },
            },
            timeSlotField({
              condition: (data) =>
                ['SCHEDULED', 'IN_TRANSIT', 'READY_FOR_PICKUP'].includes(data.status),
            }),
            {
              name: 'instructions',
              label: 'Delivery Instructions',
              type: 'textarea',
              admin: {
                description: 'Special instructions for delivery (e.g., leave at door, ring bell)',
              },
            },
          ],
        },
        {
          name: 'meetupDetails',
          label: 'Meetup Details',
          admin: {
            condition: (data) => data.mode === 'MEETUP',
          },
          fields: [
            {
              name: 'address',
              label: 'Meetup Location',
              type: 'relationship',
              relationTo: 'addresses',
              required: true,
            },
            {
              name: 'date',
              label: 'Meetup Date',
              type: 'date',
              admin: {
                condition: (data) => ['CONFIRMED', 'SCHEDULED'].includes(data.status),
              },
            },
            {
              name: 'proposedTimeSlots',
              label: 'Proposed Time Slots',
              type: 'array',
              fields: [timeSlotField()],
              admin: {
                condition: (data) => data.status === 'PENDING_CONFIRMATION',
              },
            },
            {
              name: 'confirmedTimeSlot',
              label: 'Confirmed Time Slot',
              type: 'date',
              admin: {
                condition: (data) => ['CONFIRMED', 'SCHEDULED'].includes(data.status),
              },
            },
            {
              name: 'proposedBy',
              label: 'Initially Proposed By',
              type: 'select',
              options: [
                { label: 'Donor', value: 'DONOR' },
                { label: 'Requester', value: 'REQUESTER' },
              ],
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'instructions',
              label: 'Meetup Instructions',
              type: 'textarea',
              admin: {
                description: 'Instructions for the meetup location and process',
              },
            },
          ],
        },
        {
          name: 'tracking',
          label: 'Tracking & Status',
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
            {
              name: 'failureReason',
              label: 'Failure Reason',
              type: 'textarea',
              admin: {
                condition: (data) => data.status === 'FAILED',
                description: 'Reason why delivery failed',
              },
            },
          ],
        },
      ],
    },
  ],
};
