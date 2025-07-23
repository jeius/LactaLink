import { ownerField } from '@/fields/ownerField';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP, ORGANIZATION_TYPES } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionOwnerOrAdmin } from '../_access-control';

export const MilkBanks: CollectionConfig<'milkBanks'> = {
  slug: 'milkBanks',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: collectionOwnerOrAdmin,
    delete: collectionOwnerOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.PROFILES,
    description:
      'Milk Bank profile of users, including their details such as name, type, head, and contact information.',
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
          options: Object.values(ORGANIZATION_TYPES),
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
  ],
};
