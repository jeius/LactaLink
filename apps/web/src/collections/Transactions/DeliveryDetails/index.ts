import { createdByField } from '@/fields/createdByField';
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
    useAsTitle: 'id',
    defaultColumns: ['transaction', 'mode', 'datetime', 'status', 'createdBy', 'createdAt'],
  },
  hooks: {
    afterChange: [afterChange],
  },
  fields: [
    {
      name: 'transaction',
      type: 'relationship',
      relationTo: 'transactions',
      required: true,
      index: true,
      admin: {
        description: 'The transaction this delivery belongs to',
      },
    },

    {
      name: 'mode',
      type: 'select',
      enumName: 'enum_delivery_options',
      required: true,
      options: Object.values(DELIVERY_OPTIONS),
      admin: {
        description: 'Method of delivery',
      },
    },

    {
      name: 'datetime',
      type: 'date',
      required: true,
      admin: {
        description: 'Delivery date and time',
        date: {
          displayFormat: 'd MMM yyy HH:mm a',
          pickerAppearance: 'dayAndTime',
        },
      },
    },

    {
      name: 'address',
      type: 'relationship',
      relationTo: 'addresses',
      admin: {
        description: 'Location for pickup/delivery/meetup',
      },
    },

    {
      name: 'instructions',
      type: 'textarea',
      access: {
        read: () => true,
        update: ({ req, data }) => data?.createdBy === req.user?.id,
      },
      admin: {
        description: 'Additional instructions or notes',
      },
    },

    { ...createdByField, required: true },

    {
      name: 'status',
      type: 'select',
      required: true,
      enumName: 'enum_delivery_details_status',
      defaultValue: DELIVERY_DETAILS_STATUS.PENDING,
      options: Object.values(DELIVERY_DETAILS_STATUS),
      admin: {
        description: 'Current status of this delivery',
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Agreements',
          fields: [
            {
              name: 'agreements',
              label: 'Delivery Agreements',
              type: 'join',
              collection: 'delivery-agreements',
              on: 'deliveryDetails',
              maxDepth: 3,
              defaultLimit: 2,
              admin: {
                description: 'View agreements from involved parties for this delivery proposal',
              },
            },
          ],
        },
      ],
    },
  ],
};
