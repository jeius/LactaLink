import { createUserField, createUserProfileField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { NullableValidator } from '@lactalink/agents/payload';
import { MILK_BAG_STATUS } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { afterChange } from './hooks/afterChange';
import { afterDelete } from './hooks/afterDelete';
import { beforeChange } from './hooks/beforeChange';
import { beforeRead } from './hooks/beforeRead';
import { beforeValidate } from './hooks/beforeValidate';
import { createExpiryDate, generateCode } from './hooks/fieldHook';

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
  versions: {
    maxPerDoc: 20,
    drafts: { autosave: true },
  },
  trash: true,
  hooks: {
    beforeValidate: [beforeValidate],
    beforeRead: [beforeRead],
    beforeChange: [beforeChange],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  indexes: [{ fields: ['status'] }, { fields: ['expiresAt'] }],
  defaultPopulate: {
    _status: true,
    donor: true,
    owner: true,
    bagImage: true,
    code: true,
    volume: true,
    collectedAt: true,
    expiresAt: true,
    deletedAt: true,
    title: true,
    status: true,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      hooks: { beforeValidate: [generateCode] },
      validate: NullableValidator.text,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Unique identifier for the milk bag, auto-generated on creation.',
      },
    },

    {
      name: 'title',
      type: 'text',
      required: true,
      validate: NullableValidator.text,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Human-readable title for the milk bag, auto-generated from code and volume.',
      },
    },

    createUserField({ name: 'createdBy', required: true }),

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
          ...createUserProfileField({ name: 'owner', label: 'Owner Profile', required: true }),
          admin: {
            position: undefined,
            description:
              'Current owner of the milk bag, auto-populated based on authenticated user.',
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
                  required: true,
                  hooks: { beforeChange: [createExpiryDate] },
                  validate: NullableValidator.date,
                  admin: {
                    description:
                      'Date when the milk expires, auto-generated based on collectedAt date plus shelf life.',
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
          label: 'Milk Bag Events',
          fields: [
            {
              name: 'milkBagEvents',
              label: 'Milk Bag Events',
              type: 'join',
              collection: 'milk-bag-events',
              on: 'milkBag',
              admin: {
                description:
                  'Timeline of events related to this milk bag, such as transfers and status changes.',
                defaultColumns: ['eventType', 'fromParty', 'toParty', 'occuredAt'],
              },
            },
          ],
        },

        {
          label: 'Metadata',
          fields: [
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

            {
              name: 'inventory',
              type: 'relationship',
              relationTo: 'inventories',
              index: true,
              admin: {
                description: 'The inventory record this milk bag is stored to (if any)',
              },
            },
          ],
        },
      ],
    },
  ],
};
