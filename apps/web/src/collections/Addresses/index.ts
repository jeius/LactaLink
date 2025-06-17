import { ownerField } from '@/fields/ownerField';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionOwnerOrAdmin } from '../_access-control';
import { generateDisplayName } from './hooks/generateDisplayName';
import { generateIslandGroupAndRegion } from './hooks/generateIslandGroupAndRegion';

export const Addresses: CollectionConfig<'addresses'> = {
  slug: 'addresses',
  admin: {
    group: COLLECTION_GROUP.PROFILES,
    description:
      'Addresses of users, which are used to identify locations for various purposes such as shipping and identification.',
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'name', 'default', 'owner'],
  },
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: collectionOwnerOrAdmin,
    delete: collectionOwnerOrAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: 'Address Name',
          type: 'text',
          admin: {
            description: 'e.g. Home, Workplace.',
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'default',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Set as default address.',
            width: '50%',
          },
        },
      ],
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
    },
    {
      name: 'street',
      label: 'Street Address',
      type: 'text',
    },
    {
      name: 'displayName',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
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
    ownerField,
    {
      name: 'coordinates',
      type: 'point',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [generateDisplayName, generateOwner, generateIslandGroupAndRegion],
  },
};
