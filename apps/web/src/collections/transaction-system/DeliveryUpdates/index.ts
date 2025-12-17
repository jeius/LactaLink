import {
  admin,
  authenticated,
  involvedPartiesOrAdmin,
  userOrAdmin,
} from '@/collections/_access-control';
import { createUserField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { DELIVERY_UPDATES } from '@lactalink/enums';
import { CollectionConfig } from 'payload';

export const DeliveryUpdates: CollectionConfig<'delivery-updates'> = {
  slug: 'delivery-updates',
  admin: {
    group: COLLECTION_GROUP.TRANSACTION,
    hidden: true,
    description: 'Tracks status updates for deliveries',
  },
  access: {
    admin: admin,
    create: authenticated,
    read: involvedPartiesOrAdmin,
    update: involvedPartiesOrAdmin,
    delete: userOrAdmin,
  },
  indexes: [{ fields: ['transaction', 'user'], unique: true }],
  fields: [
    createUserField({ name: 'user', required: true, index: true }),

    {
      name: 'transaction',
      type: 'relationship',
      relationTo: 'transactions',
      required: true,
      index: true,
      admin: {
        description: 'The transaction this update belongs to',
      },
    },

    {
      name: 'status',
      type: 'select',
      enumName: 'enum_delivery_updates_status',
      required: true,
      options: Object.values(DELIVERY_UPDATES),
      admin: {
        description: 'Status update for the delivery',
      },
    },
  ],
};
