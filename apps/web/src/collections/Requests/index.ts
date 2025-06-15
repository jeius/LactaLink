import { createdByField } from '@/fields/createdByField';
import { priorityLevel } from '@/fields/priorityLevel';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants';
import { Request } from '@lactalink/types';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { filterMatchedDonationOptions, filterMilkBagsOptions } from './filterOptions';
import { createRequestNotification } from './hooks/createNotification';
import { generateTitle } from './hooks/generateTitle';
import { updateMilkBag, updateStatus } from './hooks/update';

export const Requests: CollectionConfig<'requests'> = {
  slug: 'requests',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: collectionCreatorOrAdmin,
    delete: collectionCreatorOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'title',
    defaultColumns: ['requester', 'volumeNeeded', 'status', 'createdAt'],
  },
  hooks: {
    beforeChange: [generateCreatedBy, generateTitle, updateStatus],
    afterChange: [updateMilkBag, createRequestNotification],
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
      name: 'requestedDonor',
      type: 'relationship',
      relationTo: 'individuals',
      admin: {
        description: 'The donor who is requested to fulfill this request',
        position: 'sidebar',
      },
    },

    createdByField,

    {
      name: 'matchedAt',
      type: 'date',
      admin: {
        description: 'Date when the request was matched with a donation',
        position: 'sidebar',
        readOnly: true,
      },
    },

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
          name: 'status',
          label: 'Request Status',
          type: 'select',
          required: true,
          defaultValue: 'PENDING',
          admin: {
            description: 'Current status of the request',
            width: '50%',
          },
          options: [
            { label: 'Pending', value: 'PENDING' },
            { label: 'Matched', value: 'MATCHED' },
            { label: 'Fulfilled', value: 'FULFILLED' },
            { label: 'Cancelled', value: 'CANCELLED' },
            { label: 'Expired', value: 'EXPIRED' },
          ],
        },
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
          name: 'matchedDonation',
          type: 'relationship',
          relationTo: 'donations',
          filterOptions: filterMatchedDonationOptions,
          admin: {
            description: 'The donation that fulfilled this request',
            width: '50%',
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
                      defaultValue: 'EITHER',
                      options: [
                        { label: 'Fresh (Refrigerated)', value: 'FRESH' },
                        { label: 'Frozen', value: 'FROZEN' },
                        { label: 'Either', value: 'EITHER' },
                      ],
                      admin: {
                        description: 'Preferred storage type',
                        width: '40%',
                      },
                    },
                    priorityLevel({
                      name: 'urgency',
                      defaultValue: 'LOW',
                      label: 'Urgency Level',
                    }),
                  ],
                },
                {
                  name: 'bags',
                  label: 'Milk Bags',
                  type: 'relationship',
                  relationTo: 'milkBags',
                  hasMany: true,
                  filterOptions: filterMilkBagsOptions,
                  validate: async (value, { data }: { data: Partial<Request> }) => {
                    if (data.matchedDonation && (!value || value.length === 0)) {
                      return 'At least one milk bag is required when a matched donation exists.';
                    }
                    return true;
                  },
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
        {
          label: 'Delivery',
          fields: [
            {
              name: 'deliveryDetails',
              label: 'Delivery Details',
              type: 'relationship',
              relationTo: 'deliveryPreferences',
              hasMany: true,
              required: true,
              admin: {
                description: 'Delivery preferences for the milk donation',
              },
            },
            {
              name: 'delivery',
              type: 'join',
              on: 'request',
              collection: 'deliveries',
            },
          ],
        },
      ],
    },
  ],
};
