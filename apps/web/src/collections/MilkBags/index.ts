import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { generateOwner } from '@/hooks/collections/generateOwner';
import {
  COLLECTION_GROUP,
  MILK_BAG_OWNERSHIP_TRANSFER_REASONS,
  MILK_BAG_STATUS,
} from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { generateCode, generateExpiry, generateTitle } from './hooks/generate';
import { updateOwnershipHistory } from './hooks/updateOwnershipHistory';

const REASON_OPTIONS = MILK_BAG_OWNERSHIP_TRANSFER_REASONS;

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
    beforeChange: [
      generateCreatedBy,
      generateOwner,
      generateExpiry,
      generateCode,
      generateTitle,
      updateOwnershipHistory,
    ],
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
      type: 'row',
      fields: [
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
          name: 'owner',
          label: 'Current Owner',
          type: 'relationship',
          relationTo: ['individuals', 'hospitals', 'milkBanks'],
          required: true,
          admin: {
            description: 'Current owner of the milk bag',
          },
        },
      ],
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
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
                  defaultValue: MILK_BAG_STATUS.DRAFT.value,
                  admin: {
                    description: 'Current status of the milk bag',
                    width: '50%',
                  },
                  options: Object.values(MILK_BAG_STATUS),
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
              name: 'bagImage',
              label: 'Milk Bag Photo',
              type: 'upload',
              relationTo: 'milk-bag-images',
              admin: {
                description:
                  'Upload a photo showing the milk bag with the code clearly visible. This can be added after initial creation.',
              },
            },
          ],
        },
        {
          label: 'Ownership History',
          fields: [
            {
              name: 'ownershipHistory',
              label: 'Ownership History',
              interfaceName: 'MilkBagOwnershipHistory',
              type: 'array',
              admin: {
                description: 'History of ownership transfers',
              },
              fields: [
                {
                  name: 'previousOwner',
                  type: 'relationship',
                  required: true,
                  relationTo: ['individuals', 'hospitals', 'milkBanks'],
                },
                {
                  name: 'newOwner',
                  type: 'relationship',
                  relationTo: ['individuals', 'hospitals', 'milkBanks'],
                  required: true,
                },
                {
                  name: 'transferReason',
                  type: 'select',
                  enumName: 'enum_milk_bag_transfer_reason',
                  required: true,
                  defaultValue: REASON_OPTIONS['N/A'].value,
                  options: Object.values(REASON_OPTIONS),
                },
                {
                  name: 'transferredAt',
                  type: 'date',
                  defaultValue: () => new Date(),
                },
              ],
            },
          ],
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
