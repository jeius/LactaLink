import { createdByField } from '@/fields/createdByField';
import { seenTrackingFields } from '@/fields/seenTrackingField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { updateSeenTracking } from '@/hooks/collections/updateSeenTracking';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../_access-control';
import { confirmedField, proposedField } from './fields/deliveryFields';
import { trackingField } from './fields/tracking';
import { filterMilkBagsOptions } from './filterOptions';
import { calculateVolume } from './hooks/caculateVolume';
import { generateTransactionNumber } from './hooks/generateTransactionNumber';
import { processDeliveryAgreements } from './hooks/processDeliveryAgreements';
import { updateRelatedCollectionsOnCreate } from './hooks/updateRelatedCollectionsOnCreate';

export const Transactions: CollectionConfig<'transactions'> = {
  slug: 'transactions',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: admin,
  },
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'transactionNumber',
    defaultColumns: ['transactionNumber', 'donation', 'request', 'status', 'createdAt'],
  },
  hooks: {
    beforeRead: [calculateVolume],
    beforeChange: [
      generateCreatedBy,
      generateTransactionNumber,
      processDeliveryAgreements,
      updateSeenTracking,
    ],
    afterChange: [updateRelatedCollectionsOnCreate],
  },
  fields: [
    {
      name: 'transactionNumber',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Unique transaction identifier',
      },
    },

    createdByField,
    ...seenTrackingFields,

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
          defaultValue: TRANSACTION_STATUS.MATCHED.value,
          options: Object.values(TRANSACTION_STATUS),
          admin: { width: '50%' },
        },

        {
          name: 'matchedVolume',
          label: 'Matched Volume (mL)',
          type: 'number',
          virtual: true,
          required: true,
          defaultValue: 0,
          min: 1,
          hasMany: false,
          admin: {
            description: 'Volume of milk being matched (in mL)',
            width: '50%',
          },
          validate: () => true, // Always valid, calculated on read
        },

        {
          name: 'transactionType',
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
      ],
    },

    {
      name: 'matchedBags',
      type: 'relationship',
      relationTo: 'milkBags',
      hasMany: true,
      required: true,
      filterOptions: filterMilkBagsOptions,
      admin: {
        description: 'Milk bags included in this transaction',
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Delivery Details',
          fields: [
            {
              name: 'delivery',
              interfaceName: 'Delivery',
              type: 'group',
              fields: [
                proposedField,
                confirmedField,
                {
                  name: 'instructions',
                  label: 'Delivery Instructions',
                  type: 'textarea',
                },
              ],
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
