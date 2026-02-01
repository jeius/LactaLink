import { createUserField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { CollectionConfig } from 'payload';
import { authenticated, userOrAdmin } from './_access-control';

export const DonationReads: CollectionConfig<'donation-reads'> = {
  slug: 'donation-reads',
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    hidden: true,
    description: 'Tracks which users have seen which donations',
    useAsTitle: 'donation',
  },
  access: {
    read: userOrAdmin,
    create: authenticated,
    update: () => false, // Read receipts are immutable
    delete: userOrAdmin,
  },
  indexes: [
    {
      fields: ['donation', 'user'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'donation',
      type: 'relationship',
      relationTo: 'donations',
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

export default DonationReads;
