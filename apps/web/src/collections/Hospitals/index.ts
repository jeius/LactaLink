import { ownerField } from '@/fields/ownerField';
import { deletePreviousAvatar } from '@/hooks/collections/deletePreviousAvatar';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP, ORGANIZATION_TYPES } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionOwnerOrAdmin } from '../_access-control';

export const Hospitals: CollectionConfig<'hospitals'> = {
  slug: 'hospitals',
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
      'Hospital profile of users, including their details such as name, type, head, and contact information.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'head', 'owner'],
  },
  hooks: {
    beforeChange: [generateOwner],
    afterChange: [deletePreviousAvatar],
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
