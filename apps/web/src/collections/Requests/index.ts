import { createdByField } from '@/fields/createdByField';
import { deliveryTab } from '@/fields/deliveryTab';
import { statusTimeStamps } from '@/fields/statusTimeStamps';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { initializeStatus } from '@/hooks/collections/initializeStatus';
import {
  COLLECTION_GROUP,
  DONATION_REQUEST_STATUS,
  PREFERRED_STORAGE_TYPES,
  PRIORITY_LEVELS,
} from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { calculateFulfillmentPercentage } from './hooks/calculateFulfillmentPercentage';
import { createRequestNotification } from './hooks/createNotification';
import { generateTitle } from './hooks/generateTitle';
import { initializeRequest } from './hooks/initialize';
import { processOrganizationRequest } from './hooks/processOrganizationRequest';

export const Requests: CollectionConfig<'requests'> = {
  slug: 'requests',
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
    defaultColumns: ['requester', 'volumeNeeded', 'volumeFulfilled', 'status', 'createdAt'],
  },
  hooks: {
    beforeValidate: [initializeRequest],
    beforeChange: [initializeStatus, generateCreatedBy, generateTitle],
    afterChange: [createRequestNotification, processOrganizationRequest],
    beforeRead: [calculateFulfillmentPercentage],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Title of the milk request.',
        readOnly: true,
        position: 'sidebar',
      },
    },

    {
      name: 'fulfillmentPercentage',
      type: 'number',
      virtual: true,
      admin: {
        description: 'Percentage of the request that has been fulfilled.',
        readOnly: true,
        position: 'sidebar',
      },
    },

    {
      name: 'remainingNeeded',
      type: 'number',
      virtual: true,
      admin: {
        description: 'Volume still needed to fulfill the request.',
        readOnly: true,
        position: 'sidebar',
      },
    },

    ...statusTimeStamps,

    {
      name: 'expiredAt',
      type: 'date',
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
          name: 'requester',
          type: 'relationship',
          relationTo: 'individuals',
          required: true,
          admin: {
            description: 'The person requesting the milk',
            width: '50%',
          },
        },
        {
          name: 'recipient',
          type: 'relationship',
          relationTo: ['individuals', 'hospitals', 'milkBanks'],
          hasMany: false,
          admin: {
            description:
              'Who this request is directed to (optional - leave empty for general request)',
            width: '50%',
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'volumeNeeded',
          label: 'Volume Needed (mL)',
          type: 'number',
          required: true,
          min: 20,
          admin: {
            description: 'Amount of milk needed in milliliters',
            width: '50%',
            step: 10,
          },
        },

        {
          name: 'volumeFulfilled',
          label: 'Volume Fulfilled (mL)',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Amount of milk already fulfilled in milliliters',
            width: '50%',
            step: 10,
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Request Status',
          type: 'select',
          enumName: 'enum_donation_request_status',
          required: true,
          defaultValue: DONATION_REQUEST_STATUS.AVAILABLE.value,
          options: Object.values(DONATION_REQUEST_STATUS),
          admin: { width: '50%' },
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
              name: 'details',
              label: 'Details',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'neededAt',
                      label: 'Date Needed',
                      type: 'date',
                      required: true,
                      admin: {
                        description: 'Date when the milk is needed',
                        width: '40%',
                      },
                    },
                    {
                      name: 'storagePreference',
                      label: 'Storage Preference',
                      type: 'select',
                      defaultValue: PREFERRED_STORAGE_TYPES.EITHER.value,
                      options: Object.values(PREFERRED_STORAGE_TYPES),
                      admin: {
                        description: 'Preferred storage type',
                        width: '40%',
                      },
                    },
                    {
                      name: 'urgency',
                      type: 'select',
                      label: 'Urgency Level',
                      enumName: 'enum_priority_level',
                      required: true,
                      defaultValue: PRIORITY_LEVELS.LOW.value,
                      options: Object.values(PRIORITY_LEVELS),
                    },
                  ],
                },
                {
                  name: 'bags',
                  label: 'Milk Bags',
                  type: 'relationship',
                  relationTo: 'milkBags',
                  hasMany: true,
                  admin: {
                    description:
                      'Milk bags that fulfilled this request. If empty, it means the request is still pending.',
                  },
                },
                {
                  type: 'upload',
                  name: 'image',
                  label: 'Recipient Image',
                  relationTo: 'images',
                  admin: {
                    description: 'Image of the person or baby receiving the milk',
                  },
                },
                {
                  name: 'reason',
                  type: 'textarea',
                  admin: {
                    description: 'Reason for requesting milk donation',
                  },
                },
                {
                  name: 'notes',
                  type: 'textarea',
                  admin: {
                    description: 'Additional notes or special instructions from requester',
                  },
                },
              ],
            },
          ],
        },
        deliveryTab(),
        {
          label: 'Transactions',
          fields: [
            {
              name: 'transactions',
              label: 'Transactions',
              type: 'join',
              collection: 'transactions',
              on: 'donation',
              admin: {
                description: 'Transactions associated with this donation',
                defaultColumns: [
                  'transactionNumber',
                  'request',
                  'status',
                  'matchedVolume',
                  'createdAt',
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
