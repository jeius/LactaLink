import { createUserField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { CollectionConfig } from 'payload';
import { admin, authenticated, userOrAdmin } from '../_access-control';

export const TransactionReads: CollectionConfig<'transaction-reads'> = {
  slug: 'transaction-reads',
  admin: {
    group: COLLECTION_GROUP.TRANSACTION,
    hidden: true,
    description: 'Tracks which users have read which transactions',
  },
  access: {
    admin: admin,
    create: authenticated,
    read: userOrAdmin,
    update: userOrAdmin,
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
    },
  ],
};
