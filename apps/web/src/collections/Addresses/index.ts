import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { generateCompleteName } from './hooks/generateCompleteName';
import { generateCreatedBy } from './hooks/generateCreatedBy';
import { generateOwner } from './hooks/generateOwner';

export const Addresses: CollectionConfig<'addresses'> = {
  slug: 'addresses',
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'name',
    defaultColumns: ['completeName', 'owner'],
  },
  fields: [
    {
      name: 'name',
      label: 'Address Name',
      type: 'text',
      admin: {
        description: 'e.g. Home, Workplace.',
      },
    },
    {
      name: 'street',
      label: 'Street Address',
      type: 'text',
    },
    {
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
      required: true,
    },
    {
      name: 'province',
      type: 'relationship',
      relationTo: 'provinces',
      required: true,
    },
    {
      name: 'cityMunicipality',
      label: 'City/Municipality',
      type: 'relationship',
      relationTo: 'citiesMunicipalities',
      required: true,
    },
    {
      name: 'barangay',
      type: 'relationship',
      relationTo: 'barangays',
      required: true,
    },
    {
      name: 'islandGroup',
      type: 'relationship',
      relationTo: 'islandGroups',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'completeName',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: ['users'],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [generateCompleteName, generateOwner, generateCreatedBy],
  },
};
