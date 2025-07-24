import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import {
  COLLECTION_GROUP,
  COLLECTION_MODES,
  DONATION_STATUS,
  STORAGE_TYPES,
} from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { filterMilkBagsOptions } from './filterOptions';
import { createDonationNotification } from './hooks/createNotification';
import { generateTitle } from './hooks/generateTitle';
import { initialize } from './hooks/initialize';
import { checkStatus } from './hooks/updateStatus';

export const Donations: CollectionConfig<'donations'> = {
  slug: 'donations',
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
    defaultColumns: ['donor', 'volume', 'remainingVolume', 'status', 'createdAt'],
  },
  hooks: {
    beforeRead: [checkStatus],
    beforeChange: [initialize, generateCreatedBy, generateTitle],
    afterChange: [createDonationNotification],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Title of the donation record.',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'volume',
      label: 'Total Volume (mL)',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total volume of milk donated.',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'remainingVolume',
      label: 'Remaining Volume (mL)',
      type: 'number',
      admin: {
        description: 'Volume still available for allocation',
        readOnly: true,
        position: 'sidebar',
      },
    },
    createdByField,
    {
      type: 'row',
      fields: [
        {
          name: 'donor',
          type: 'relationship',
          relationTo: 'individuals',
          required: true,
          admin: {
            description: 'The person donating the milk',
          },
        },
        {
          name: 'status',
          label: 'Donation Status',
          type: 'select',
          required: true,
          defaultValue: DONATION_STATUS.AVAILABLE.value,
          options: Object.values(DONATION_STATUS),
        },
      ],
    },

    {
      name: 'matchedRequests',
      label: 'Matched Requests',
      type: 'relationship',
      relationTo: 'requests',
      hasMany: true,
      maxDepth: 2,
      admin: {
        description: 'The requests that this donation fulfills',
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            {
              name: 'details',
              label: 'Milk Details',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'storageType',
                      label: 'Storage Type',
                      type: 'select',
                      required: true,
                      admin: {
                        description: 'Type of storage for the milk',
                        width: '50%',
                      },
                      options: Object.values(STORAGE_TYPES),
                    },
                    {
                      name: 'collectionMode',
                      label: 'Collection Mode',
                      type: 'select',
                      required: true,
                      admin: {
                        description: 'How the milk was collected',
                        width: '50%',
                      },
                      options: Object.values(COLLECTION_MODES),
                    },
                  ],
                },
                {
                  name: 'bags',
                  label: 'Milk Bags',
                  type: 'relationship',
                  relationTo: 'milkBags',
                  required: true,
                  hasMany: true,
                  filterOptions: filterMilkBagsOptions,
                  validate: (value) => {
                    if (!value || value.length === 0) {
                      return 'At least one milk bag must be selected';
                    }
                    return true;
                  },
                  admin: {
                    description: 'Select the milk bags used for this donation',
                  },
                },
                {
                  type: 'upload',
                  name: 'milkSample',
                  label: 'Milk Sample',
                  relationTo: 'images',
                  hasMany: true,
                  maxRows: 5,
                  admin: {
                    description: 'Upload images of the milk sample',
                  },
                },
                {
                  name: 'notes',
                  type: 'textarea',
                  admin: {
                    description: 'Additional notes or special instructions from donor',
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
              relationTo: 'delivery-preferences',
              hasMany: true,
              required: true,
              admin: {
                description: 'Delivery preferences for the milk donation',
              },
            },
            {
              name: 'deliveries',
              type: 'join',
              on: 'donation',
              collection: 'deliveries',
            },
          ],
        },
      ],
    },
  ],
};
