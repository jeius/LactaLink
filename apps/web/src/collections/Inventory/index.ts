import { CollectionConfig } from 'payload';

export const Inventory: CollectionConfig<'inventory'> = {
  slug: 'inventory',
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: ['hospitals', 'milkBanks'],
      required: true,
    },
    {
      name: 'sourceDonation',
      type: 'relationship',
      relationTo: 'donations',
      admin: {
        description: 'Original donation that created this inventory',
      },
    },
    {
      name: 'volume',
      type: 'number',
      required: true,
    },
    {
      name: 'remainingVolume',
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Available', value: 'AVAILABLE' },
        { label: 'Reserved', value: 'RESERVED' },
        { label: 'Expired', value: 'EXPIRED' },
        { label: 'Consumed', value: 'CONSUMED' },
      ],
    },
    {
      name: 'receivedAt',
      type: 'date',
      defaultValue: () => new Date(),
      admin: {
        description: 'When the organization received this donation',
      },
    },
  ],
};
