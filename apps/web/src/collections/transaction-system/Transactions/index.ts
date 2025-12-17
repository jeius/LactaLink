import { createUserProfileField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { DELIVERY_DETAILS_STATUS, TRANSACTION_STATUS, TRANSACTION_TYPE } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../../_access-control';
import { involvedUsersOrAdmin } from './access';
import { trackingField } from './fields/tracking';
import { filterMilkBagsOptions } from './filterOptions';
import { afterChange } from './hooks/afterChange';
import { calculateVolume } from './hooks/caculateVolume';
import { generateTransactionNumber } from './hooks/generateTransactionNumber';

export const Transactions: CollectionConfig<'transactions'> = {
  slug: 'transactions',
  access: {
    admin: admin,
    create: authenticated,
    read: involvedUsersOrAdmin,
    update: involvedUsersOrAdmin,
    delete: involvedUsersOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.TRANSACTION,
    useAsTitle: 'txn',
    defaultColumns: ['txn', 'volume', 'sender', 'recipient', 'status', 'createdAt'],
  },
  hooks: {
    afterChange: [afterChange],
  },
  fields: [
    {
      name: 'txn',
      label: 'Transaction Number',
      type: 'text',
      unique: true,
      required: true,
      hasMany: false,
      validate: () => true, // Always valid, automatically generated
      hooks: { beforeChange: [generateTransactionNumber] },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Unique transaction identifier',
      },
    },

    createUserProfileField({ name: 'initiatedBy', required: true }),

    {
      type: 'row',
      fields: [
        {
          name: 'donation',
          type: 'relationship',
          relationTo: 'donations',
          admin: { width: '50%' },
        },

        {
          name: 'request',
          type: 'relationship',
          relationTo: 'requests',
          admin: { width: '50%' },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'sender',
          type: 'relationship',
          required: true,
          relationTo: ['individuals', 'hospitals', 'milkBanks'],
          admin: { width: '50%' },
        },

        {
          name: 'recipient',
          type: 'relationship',
          required: true,
          relationTo: ['individuals', 'hospitals', 'milkBanks'],
          admin: { width: '50%' },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Transaction Status',
          type: 'select',
          enumName: 'enum_transaction_status',
          required: true,
          defaultValue: TRANSACTION_STATUS.PENDING.value,
          options: Object.values(TRANSACTION_STATUS),
          admin: { width: '50%' },
        },

        {
          name: 'type',
          label: 'Transaction Type',
          type: 'select',
          enumName: 'enum_transaction_type',
          required: true,
          defaultValue: TRANSACTION_TYPE.P2P.value,
          options: Object.values(TRANSACTION_TYPE),
          admin: {
            description: 'Type of transaction (determines delivery workflow)',
            position: 'sidebar',
            width: '50%',
          },
        },

        {
          name: 'volume',
          label: 'Volume (mL)',
          type: 'number',
          required: true,
          defaultValue: 0,
          hasMany: false,
          validate: () => true, // Always valid, automatically calculated
          hooks: { beforeChange: [calculateVolume] },
          admin: {
            description: 'Total volume of milk bags (in mL). Automatically calculated.',
            width: '50%',
            readOnly: true,
          },
        },
      ],
    },

    {
      name: 'milkBags',
      label: 'Milk Bags',
      type: 'relationship',
      relationTo: 'milkBags',
      hasMany: true,
      required: true,
      filterOptions: filterMilkBagsOptions,
      validate: (data) => {
        if (!data || data.length === 0) {
          return 'At least one milk bag must be selected for this transaction.';
        }
        return true;
      },
      admin: {
        description: 'Milk bags included in this transaction',
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Delivery',
          fields: [
            {
              name: 'deliveryDetails',
              label: 'Delivery Details',
              type: 'join',
              collection: 'delivery-details',
              on: 'transaction',
              defaultLimit: 1,
              maxDepth: 3,
              where: { status: { equals: DELIVERY_DETAILS_STATUS.ACCEPTED.value } },
              admin: {
                description: 'Delivery details of this transaction',
                defaultColumns: ['method', 'scheduledAt', 'address', 'notes'],
              },
            },
            {
              name: 'deliveryUpdates',
              label: 'Delivery Updates',
              type: 'join',
              collection: 'delivery-updates',
              on: 'transaction',
              maxDepth: 3,
              defaultLimit: 2,
              admin: {
                description: 'Status updates of users regarding the delivery.',
                defaultColumns: ['status', 'user'],
              },
            },
          ],
        },
        {
          label: 'Delivery Plans',
          fields: [
            {
              name: 'deliveryPlans',
              label: 'Delivery Detail',
              type: 'join',
              collection: 'delivery-details',
              on: 'transaction',
              maxDepth: 3,
              defaultLimit: 5,
              defaultSort: '-createdAt',
              admin: {
                description: 'Delivery plans proposed by users.',
                defaultColumns: ['method', 'scheduledAt', 'address', 'notes'],
              },
            },
          ],
        },
        {
          label: 'Tracking',
          fields: [trackingField],
        },
      ],
    },
  ],
};
