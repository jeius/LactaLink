import { createOrgTotalVolumeField } from '@/fields/createOrgTotalVolumeField';
import { profilesRelatedPostsField } from '@/fields/profilesRelatedPost';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { ORGANIZATION_TYPES } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionOwnerOrAdmin } from '../_access-control';
import { defaultAddressField, displayNameField, ownerField } from './fields';
import { afterChange } from './hooks/afterChange';
import { afterDelete } from './hooks/afterDelete';
import { afterRead } from './hooks/afterRead';
import { beforeChange } from './hooks/beforeChange';

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
    group: COLLECTION_GROUP.USER,
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'head', 'owner'],
  },
  hooks: {
    beforeChange: [beforeChange],
    afterChange: [afterChange],
    afterRead: [afterRead],
    afterDelete: [afterDelete],
  },
  fields: [
    displayNameField({
      admin: {
        description: 'Display name for the milk bank, used in public profiles.',
        readOnly: true,
      },
    }),

    ownerField(
      'User who owns this milk bank profile. On create, defaults to authenticated user if empty.'
    ),

    defaultAddressField(),

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Information',
          fields: [
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
        },

        {
          label: 'Inventory',
          fields: [
            {
              type: 'row',
              fields: [
                createOrgTotalVolumeField({
                  admin: {
                    description:
                      'Total volume of milk in stock at the milk bank. (Auto calculated)',
                    width: '50%',
                  },
                }),
              ],
            },
            {
              name: 'inventory',
              label: 'Inventory',
              type: 'join',
              collection: 'inventories',
              on: 'organization',
              maxDepth: 3,
              defaultLimit: 10,
              admin: {
                defaultColumns: ['remainingVolume', 'initialVolume', 'status', 'receivedAt'],
                description: 'Inventory of milk bags available in this milk bank.',
              },
            },
            {
              name: 'milkBags',
              label: 'Milk Bags',
              type: 'join',
              collection: 'milkBags',
              on: 'owner',
              maxDepth: 3,
              defaultLimit: 10,
              admin: {
                defaultColumns: ['volume', 'status', 'donor', 'createdAt'],
                description: 'Milk bags associated with this milk bank.',
              },
            },
          ],
        },

        {
          label: 'Transactions',
          fields: [
            {
              name: 'receivedTransactions',
              label: 'Donation Received Transactions',
              type: 'join',
              collection: 'transactions',
              on: 'recipient',
              maxDepth: 5,
              defaultLimit: 10,
              admin: {
                defaultColumns: ['sender', 'matchedVolume', 'status', 'donation', 'createdAt'],
                description: 'Transactions of received donations related to this hospital.',
              },
            },
            {
              name: 'sentTransactions',
              label: 'Request Fulfilled Transactions',
              type: 'join',
              collection: 'transactions',
              on: 'sender',
              maxDepth: 5,
              defaultLimit: 10,
              admin: {
                defaultColumns: ['recipient', 'matchedVolume', 'status', 'request', 'createdAt'],
                description: 'Transactions of fulfilled requests related to this hospital.',
              },
            },
          ],
        },

        {
          label: 'Posts',
          fields: [profilesRelatedPostsField()],
        },
      ],
    },
  ],
};
