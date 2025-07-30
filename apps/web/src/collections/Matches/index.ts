import { admin, authenticated } from '@/collections/_access-control';
import { statusTimeStamps } from '@/fields/statusTimeStamps';
import { COLLECTION_GROUP, MATCHES_STATUS } from '@/lib/constants';
import { CollectionConfig } from 'payload';

export const Matches: CollectionConfig<'matches'> = {
  slug: 'matches',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: admin,
  },
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'matchNumber',
    defaultColumns: ['matchNumber', 'type', 'status', 'matchedVolume', 'createdAt'],
  },
  fields: [
    {
      name: 'matchNumber',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Unique match identifier',
        position: 'sidebar',
      },
    },

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
          type: 'select',
          required: true,
          defaultValue: MATCHES_STATUS.ACCEPTED.value,
          options: Object.values(MATCHES_STATUS),
        },

        {
          name: 'matchedVolume',
          type: 'number',
          required: true,
          min: 1,
          admin: {
            description: 'Volume of milk being matched (in mL)',
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
    },

    {
      name: 'delivery',
      type: 'relationship',
      relationTo: 'deliveries',
      admin: {
        description: 'Delivery arrangement for this match',
      },
    },

    ...statusTimeStamps,
  ],
};
