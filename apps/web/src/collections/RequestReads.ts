import { createUserField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { CollectionConfig } from 'payload';
import { authenticated, userOrAdmin } from './_access-control';

export const RequestReads: CollectionConfig<'request-reads'> = {
  slug: 'request-reads',
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    hidden: true,
    description: 'Tracks which users have seen which requests',
    useAsTitle: 'request',
  },
  access: {
    read: userOrAdmin,
    create: authenticated,
    update: () => false, // Read receipts are immutable
    delete: userOrAdmin,
  },
  indexes: [
    {
      fields: ['request', 'user'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'request',
      type: 'relationship',
      relationTo: 'requests',
      required: true,
      index: true,
    },
    createUserField({
      name: 'user',
      required: true,
      index: true,
    }),
  ],
};

export default RequestReads;
