import { ownerField } from '@/fields/ownerField';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { CollectionConfig } from 'payload';
import { generateDisplayName } from './hooks/generateDisplayName';

export const Individuals: CollectionConfig<'individuals'> = {
  slug: 'individuals',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'gender', 'dependents'],
  },
  hooks: {
    beforeChange: [generateDisplayName, generateOwner],
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
      type: 'relationship',
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
          options: [
            { label: 'Male', value: 'MALE' },
            { label: 'Female', value: 'FEMALE' },
            { label: 'Other', value: 'OTHER' },
          ],
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
          options: [
            { label: 'Single', value: 'SINGLE' },
            { label: 'Married', value: 'MARRIED' },
            { label: 'Widowed', value: 'WIDOWED' },
            { label: 'Divorced', value: 'DIVORCED' },
            { label: 'Separated', value: 'SEPARATED' },
            { label: 'Prefer not to say', value: 'N/A' },
          ],
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
