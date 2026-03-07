import { profilesRelatedPostsField } from '@/fields/profilesRelatedPost';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { GENDER_TYPES, MARITAL_STATUS } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionOwnerOrAdmin } from '../_access-control';
import { defaultAddressField, displayNameField, ownerField } from './fields';
import { afterChange } from './hooks/afterChange';
import { afterRead } from './hooks/afterRead';

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
    group: COLLECTION_GROUP.USER,
    description:
      'Individuals profile of users, including their personal information such as name, date of birth, contact details, and other relevant attributes.',
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'dependents', 'gender', 'maritalStatus'],
  },
  hooks: {
    afterChange: [afterChange],
    afterRead: [afterRead],
  },
  fields: [
    {
      name: 'isVerified',
      label: 'Identity Verified',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
    },

    displayNameField({
      admin: {
        description: 'Automatically generated from given, middle, and family names.',
        readOnly: true,
      },
    }),

    ownerField('User who owns this profile. On create, defaults to authenticated user if empty.'),

    defaultAddressField(),

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

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Posts',
          fields: [profilesRelatedPostsField()],
        },
      ],
    },
  ],
};
