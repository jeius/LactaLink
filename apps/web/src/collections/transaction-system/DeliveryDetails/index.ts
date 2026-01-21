import { createUserProfileField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { DELIVERY_DETAILS_STATUS, DELIVERY_OPTIONS } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import {
  admin,
  authenticated,
  collectionCreatorOrAdmin,
  involvedPartiesOrAdmin,
} from '../../_access-control';
import { afterChange } from './hooks/afterChange';

export const DeliveryDetails: CollectionConfig<'delivery-details'> = {
  slug: 'delivery-details',
  access: {
    admin: admin,
    create: authenticated,
    read: involvedPartiesOrAdmin,
    update: involvedPartiesOrAdmin,
    delete: collectionCreatorOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.TRANSACTION,
    useAsTitle: 'method',
    defaultColumns: ['transaction', 'method', 'status', 'createdBy', 'createdAt'],
    description: 'Details for delivery, pickup, or meetup of transactions',
  },
  hooks: {
    afterChange: [afterChange],
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      enumName: 'enum_delivery_details_status',
      defaultValue: DELIVERY_DETAILS_STATUS.PENDING.value,
      options: Object.values(DELIVERY_DETAILS_STATUS),
      admin: {
        description: 'Current status of this delivery detail',
      },
    },

    {
      name: 'transaction',
      type: 'relationship',
      relationTo: 'transactions',
      required: true,
      index: true,
      admin: {
        description: 'The transaction this delivery belongs to',
        position: 'sidebar',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'method',
          type: 'select',
          enumName: 'enum_delivery_options',
          required: true,
          options: Object.values(DELIVERY_OPTIONS),
          admin: {
            description: 'Method of delivery',
            width: '50%',
          },
        },

        {
          name: 'scheduledAt',
          label: 'Schedule',
          type: 'date',
          required: true,
          admin: {
            description: 'Scheduled date and time',
            width: '50%',
            date: {
              displayFormat: 'd MMM yyy HH:mm a',
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },

    {
      name: 'address',
      type: 'relationship',
      relationTo: 'addresses',
      required: true,
      admin: {
        description: 'Location for pickup/delivery/meetup',
      },
    },

    {
      name: 'notes',
      type: 'textarea',
      access: {
        read: () => true,
        update: ({ req, data }) => data?.createdBy === req.user?.id,
      },
      admin: {
        description: 'Additional instructions or notes',
      },
    },

    createUserProfileField({ name: 'proposedBy', required: true }),
  ],
};
