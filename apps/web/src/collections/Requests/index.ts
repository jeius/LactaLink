import { createdByField } from '@/fields/createdByField';
import { deliveryTabFields } from '@/fields/deliveryTabFields';
import { priorityLevel } from '@/fields/priorityLevel';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { filterMilkBagsOptions } from './filterOptions';
import { generateTitle } from './hooks/generateTitle';
import { updateMilkBag } from './hooks/updateMilkBag';
import { updateStatus } from './hooks/updateStatus';

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
    afterChange: [updateMilkBag],
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
                  admin: {
                    description:
                      'Milk bags that fulfilled this request. If empty, it means the request is still pending.',
                  },
                  filterOptions: filterMilkBagsOptions,
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
              type: 'group',
              fields: [
                ...deliveryTabFields(),
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
    },
  ],
};
