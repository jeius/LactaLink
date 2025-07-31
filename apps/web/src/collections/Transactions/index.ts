import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP, TRANSACTION_STATUS, TRANSACTION_TYPE } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../_access-control';
import { confirmedField, proposedField } from './fields/deliveryFields';
import { trackingField } from './fields/tracking';
import { calculateVolume } from './hooks/caculateVolume';
import { generateTransactionNumber } from './hooks/generateTransactionNumber';
import { processDeliveryAgreements } from './hooks/processDeliveryAgreements';
import { updateTracking } from './hooks/updateTracking';

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
      updateTracking,
    ],
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

    {
      type: 'row',
      fields: [
        {
          name: 'donation',
          type: 'relationship',
          relationTo: 'donations',
          required: true,
          admin: { width: '50%' },
        },

        {
          name: 'request',
          type: 'relationship',
          relationTo: 'requests',
          required: true,
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
          admin: {
            description: 'Volume of milk being matched (in mL)',
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
      admin: {
        description: 'Milk bags included in this transaction',
      },
    },

    {
      name: 'transactionType',
      type: 'select',
      required: true,
      defaultValue: TRANSACTION_TYPE.P2P.value,
      options: Object.values(TRANSACTION_TYPE),
      admin: {
        description: 'Type of transaction (determines delivery workflow)',
        position: 'sidebar',
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
