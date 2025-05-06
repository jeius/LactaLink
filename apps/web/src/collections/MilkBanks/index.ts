import { CollectionConfig } from 'payload';

export const MilkBanks: CollectionConfig<'milkBanks'> = {
  slug: 'milkBanks',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type'],
  },
  fields: [
    {
      name: 'user',
      type: 'join',
      collection: 'users',
      on: 'milkBank',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'avatar',
      type: 'relationship',
      relationTo: 'avatars',
    },
    {
      name: 'name',
      label: 'Milk Bank Name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Milk Bank Description',
      type: 'textarea',
    },
    {
      name: 'head',
      label: 'Milk Bank Head',
      type: 'text',
      admin: { description: 'Head or president of the milk bank.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Milk Bank Type',
          type: 'select',
          admin: { width: '50%' },
          options: [
            { label: 'Government', value: 'GOVERNMENT' },
            { label: 'Private', value: 'PRIVATE' },
            { label: 'Other', value: 'OTHER' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          unique: true,
          admin: { width: '30%' },
        },
      ],
    },
    {
      name: 'address',
      type: 'relationship',
      relationTo: 'addresses',
      hasMany: true,
      required: true,
    },
  ],
};
