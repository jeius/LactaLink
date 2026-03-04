import { createOrgTotalVolumeField } from '@/fields/createOrgTotalVolumeField';
import { createProfileDisplayNameField } from '@/fields/createProfileDisplayNameField';
import { profilesRelatedPostsField } from '@/fields/profilesRelatedPost';
import { createUserField } from '@/fields/userField';
import { deletePreviousAvatar } from '@/hooks/collections/deletePreviousAvatar';
import { updateUserProfileOnCreate } from '@/hooks/collections/updateUserProfileOnCreate';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { ORGANIZATION_TYPES } from '@lactalink/enums';
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
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'head', 'owner'],
  },
  hooks: {
    afterChange: [updateUserProfileOnCreate, deletePreviousAvatar],
  },
  fields: [
    createProfileDisplayNameField({
      admin: {
        description: 'Display name for the hospital, used in public profiles.',
        readOnly: true,
      },
    }),

    createUserField({
      name: 'owner',
      admin: {
        description:
          'User who owns this hospital profile. On create, defaults to authenticated user if empty.',
      },
    }),

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
        },
        {
          label: 'Inventory',
          fields: [
            {
              type: 'row',
              fields: [
                createOrgTotalVolumeField({
                  admin: {
                    description: 'Total volume of milk in stock at the hospital. (Auto calculated)',
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
                description: 'Inventory of milk bags available in this hospital.',
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
                description: 'Milk bags associated with this hospital.',
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
