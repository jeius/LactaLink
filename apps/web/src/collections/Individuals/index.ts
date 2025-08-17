import { ownerField } from '@/fields/ownerField';
import { deletePreviousAvatar } from '@/hooks/collections/deletePreviousAvatar';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { updateUserProfileOnCreate } from '@/hooks/collections/updateUserProfileOnCreate';
import { COLLECTION_GROUP, GENDER_TYPES, MARITAL_STATUS } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionOwnerOrAdmin } from '../_access-control';
import { generateDisplayName } from './hooks/generateDisplayName';

export const Individuals: CollectionConfig<'individuals'> = {
  slug: 'individuals',
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
      'Individuals profile of users, including their personal information such as name, date of birth, contact details, and other relevant attributes.',
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'dependents', 'gender', 'maritalStatus', 'owner'],
  },
  hooks: {
    beforeChange: [generateDisplayName, generateOwner],
    afterChange: [updateUserProfileOnCreate, deletePreviousAvatar],
  },
  fields: [
    {
      name: 'displayName',
      label: 'Display Name',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    ownerField,
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'avatars',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'givenName',
          label: 'Given Name',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'middleName',
          label: 'Middle Name',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'familyName',
          label: 'Family Name',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'birth',
          label: 'Date of Birth',
          type: 'date',
          required: true,
          admin: { width: '50%' },
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
      type: 'row',
      fields: [
        {
          name: 'dependents',
          label: 'Number of Dependents',
          type: 'number',
          admin: { width: '20%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'gender',
          type: 'radio',
          required: true,
          admin: { width: '50%' },
          options: Object.values(GENDER_TYPES),
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'maritalStatus',
          label: 'Marital Status',
          type: 'select',
          required: true,
          admin: { width: '50%' },
          options: Object.values(MARITAL_STATUS),
        },
      ],
    },
  ],
};
