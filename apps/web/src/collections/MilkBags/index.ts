import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { generateCode, generateExpiry, generateTitle } from './hooks/generate';

export const MilkBags: CollectionConfig<'milkBags'> = {
  slug: 'milkBags',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: collectionCreatorOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'title',
    defaultColumns: ['code', 'volume', 'status', 'collectedAt', 'expiresAt'],
  },
  hooks: {
    beforeChange: [generateCreatedBy, generateExpiry, generateCode, generateTitle],
  },
  indexes: [{ fields: ['status', 'expiresAt'] }],
  fields: [
    {
      name: 'code',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    {
      name: 'title',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    createdByField,

    {
      name: 'donor',
      type: 'relationship',
      relationTo: 'individuals',
      required: true,
      admin: {
        description: 'The individual donating the milk bag',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'volume',
          label: 'Volume (mL)',
          type: 'number',
          required: true,
          min: 20,
          defaultValue: 20,
          admin: {
            description: 'Volume of milk in milliliters',
            step: 10,
            width: '50%',
          },
        },
        {
          name: 'status',
          label: 'Milk Bag Status',
          type: 'select',
          required: true,
          enumName: 'enum_milk_bag_status',
          defaultValue: 'AVAILABLE',
          admin: {
            description: 'Current status of the milk bag',
            width: '50%',
          },
          options: [
            { label: 'Available', value: 'AVAILABLE' },
            { label: 'Allocated', value: 'ALLOCATED' },
            { label: 'Expired', value: 'EXPIRED' },
            { label: 'Discarded', value: 'DISCARDED' },
          ],
        },
        {
          name: 'collectedAt',
          type: 'date',
          required: true,
          admin: {
            description: 'Date when the milk was collected',
            width: '50%',
          },
        },
        {
          name: 'expiresAt',
          type: 'date',
          admin: {
            description: 'Date when the milk expires',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'donation',
      type: 'join',
      collection: 'donations',
      on: 'details.bags',
      admin: {
        description: 'The donation this milk bag is part of',
        defaultColumns: ['title', 'status'],
      },
    },
    {
      name: 'request',
      type: 'join',
      collection: 'requests',
      on: 'details.bags',
      admin: {
        description: 'The request this milk bag fulfills.',
        defaultColumns: ['title', 'status'],
      },
    },
  ],
};
