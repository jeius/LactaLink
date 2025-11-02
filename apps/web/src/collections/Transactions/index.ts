import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { DELIVERY_OPTIONS, TRANSACTION_STATUS, TRANSACTION_TYPE } from '@lactalink/enums';
import { Delivery } from '@lactalink/types/payload-generated-types';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../_access-control';
import { involvedUsersOrAdmin } from './access';
import { confirmedField, proposedField } from './fields/deliveryFields';
import { trackingField } from './fields/tracking';
import { filterMilkBagsOptions } from './filterOptions';
import { calculateMatchedVolume } from './hooks/caculateVolume';
import { generateTransactionNumber } from './hooks/generateTransactionNumber';
import { processDeliveryAgreements } from './hooks/processDeliveryAgreements';
import { initializeSeenTracking, updateSeenTracking } from './hooks/seenTracking';
import { updateRelatedCollectionsOnCreate } from './hooks/updateRelatedCollectionsOnCreate';

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
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'transactionNumber',
    defaultColumns: [
      'transactionNumber',
      'matchedVolume',
      'sender',
      'recipient',
      'status',
      'createdAt',
    ],
  },
  hooks: {
    beforeChange: [
      generateCreatedBy,
      generateTransactionNumber,
      processDeliveryAgreements,
      calculateMatchedVolume,
      initializeSeenTracking,
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
                  name: 'arrival',
                  label: 'Arrival Details',
                  type: 'group',
                  admin: {
                    condition: (_, { confirmed }: Partial<Delivery>) =>
                      confirmed?.mode === DELIVERY_OPTIONS.MEETUP.value,
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'senderArrivedAt',
                          label: 'Sender Arrived At',
                          type: 'date',
                          admin: {
                            width: '50%',
                            date: {
                              displayFormat: 'd MMM yyy HH:mm a',
                              pickerAppearance: 'dayAndTime',
                            },
                          },
                        },
                        {
                          name: 'recipientArrivedAt',
                          label: 'Recipient Arrived At',
                          type: 'date',
                          admin: {
                            width: '50%',
                            date: {
                              displayFormat: 'd MMM yyy HH:mm a',
                              pickerAppearance: 'dayAndTime',
                            },
                          },
                        },
                      ],
                    },
                  ],
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
