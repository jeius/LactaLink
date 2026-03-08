import { deliveryTab } from '@/fields/deliveryTab';
import { createUserField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { NullableValidator } from '@lactalink/agents/payload';
import { PREFERRED_STORAGE_TYPES, PRIORITY_LEVELS } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../../_access-control';
import { recipientField, timeStampFields, titleField } from '../_fields';
import { statusField } from '../_fields/statusField';
import { afterChange } from '../_hooks/afterChange';
import { afterDelete } from '../_hooks/afterDelete';
import { afterRead } from '../_hooks/afterRead';
import { caculateFulfillmentPercentage } from '../_hooks/calculateFulfillmentPercentage';
import { requestsEndpoints } from './endpoints';
import { beforeValidate } from './hooks/beforeValidate';

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
    beforeValidate: [beforeValidate],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
    afterRead: [afterRead],
  },
  endpoints: requestsEndpoints,
  fields: [
    titleField({
      description:
        'Title of the milk request record. (Auto-generated based on requester and volume needed)',
    }),

    {
      name: 'fulfillmentPercentage',
      type: 'number',
      virtual: true,
      hooks: { afterRead: [caculateFulfillmentPercentage] },
      admin: {
        description: 'Percentage of the request that has been fulfilled.',
        readOnly: true,
        position: 'sidebar',
      },
    },

    ...timeStampFields(),

    createUserField({ name: 'createdBy', required: true }),

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
        recipientField({
          description:
            'Who this request is directed to (optional - leave empty for general request)',
        }),
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'initialVolumeNeeded',
          label: 'Initial Volume Needed (mL)',
          type: 'number',
          required: true,
          min: 20,
          defaultValue: 20,
          admin: {
            description: 'Initial volume needed for the request, used for calculations.',
            width: '40%',
            step: 10,
          },
        },

        {
          name: 'volumeNeeded',
          label: 'Volume Needed (mL)',
          type: 'number',
          defaultValue: 20,
          required: true,
          validate: NullableValidator.number,
          admin: {
            description: 'Amount of milk needed in milliliters',
            width: '30%',
          },
        },

        {
          name: 'volumeFulfilled',
          label: 'Volume Fulfilled (mL)',
          type: 'number',
          defaultValue: 0,
          required: true,
          validate: NullableValidator.number,
          admin: {
            description: 'Amount of milk already fulfilled in milliliters',
            width: '30%',
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [statusField('Request Status')],
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
          label: 'Read Tracking',
          fields: [
            {
              name: 'reads',
              label: 'Read by Users',
              type: 'join',
              collection: 'request-reads',
              on: 'request',
              admin: {
                description: 'Users who have seen this request',
                defaultColumns: ['user', 'createdAt'],
              },
            },
          ],
        },

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
