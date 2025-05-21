import { ownerField } from '@/fields/ownerField';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { CollectionConfig } from 'payload';

export const Hospitals: CollectionConfig<'hospitals'> = {
  slug: 'hospitals',
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
      label: 'Hospital Name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Hospital Description',
      type: 'textarea',
    },
    {
      name: 'head',
      label: 'Hospital Head',
      type: 'text',
      admin: { description: 'Head or president of the hospital.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'hospitalID',
          label: 'Hospital ID',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'type',
          label: 'Hospital Type',
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
