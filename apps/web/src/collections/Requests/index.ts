import { deliveryTab } from '@/fields/deliveryTab';
import { statusTimeStamps } from '@/fields/statusTimeStamps';
import { createUserField } from '@/fields/userField';
import { cleanReadTrackingOnUpdate } from '@/hooks/collections/cleanReadTrackingOnUpdate';
import { generateTitleForDonationOrRequest } from '@/hooks/collections/fieldHooks';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { initStatusOnRecipient } from '@/hooks/collections/initStatusOnRecipient';
import { updateSeenTracking } from '@/hooks/collections/updateSeenTracking';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { NullableValidator } from '@lactalink/agents/payload';
import {
  DONATION_REQUEST_STATUS,
  PREFERRED_STORAGE_TYPES,
  PRIORITY_LEVELS,
} from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { requestsEndpoints } from './endpoints';
import { afterDelete } from './hooks/afterDelete';
import { calculateVolumes } from './hooks/calculateVolumes';
import { generateTitle } from './hooks/generateTitle';
import { initializeRequest } from './hooks/initialize';
import { createRequestNotification } from './hooks/notifications';
import { processOrganizationRequest } from './hooks/processOrganizationRequest';
import { updateVolume } from './hooks/updateVolume';

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
    beforeRead: [({ doc, req }) => calculateVolumes(doc, req)],
    beforeValidate: [initializeRequest, ({ data, req }) => calculateVolumes(data, req)],
    beforeChange: [
      initStatusOnRecipient,
      generateCreatedBy,
      generateTitle,
      updateVolume,
      updateSeenTracking,
    ],
    afterChange: [createRequestNotification, processOrganizationRequest, cleanReadTrackingOnUpdate],
    afterDelete: [afterDelete],
  },
  endpoints: requestsEndpoints,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      validate: NullableValidator.text,
      hooks: { beforeChange: [generateTitleForDonationOrRequest] },
      admin: {
        description:
          'Title of the milk request record. (Auto-generated based on requester and volume needed)',
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

    ...statusTimeStamps,

    {
      name: 'expiredAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

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
          hasMany: false,
          validate: () => true, // Always valid as it's calculated
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
          hasMany: false,
          validate: () => true, // Always valid as it's calculated
          admin: {
            description: 'Amount of milk already fulfilled in milliliters',
            width: '30%',
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
