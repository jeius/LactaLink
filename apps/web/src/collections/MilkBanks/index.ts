import { ownerField } from '@/fields/ownerField';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { CollectionConfig } from 'payload';

export const MilkBanks: CollectionConfig<'milkBanks'> = {
  slug: 'milkBanks',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'head', 'owner'],
  },
  hooks: {
    beforeChange: [generateOwner],
  },
  fields: [
    ownerField,
    {
      name: 'avatar',
      type: 'upload',
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
      name: 'addresses',
      type: 'relationship',
      relationTo: 'addresses',
      hasMany: true,
      required: true,
    },
  ],
};
