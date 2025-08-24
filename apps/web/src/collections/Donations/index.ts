import { processDonationToOrganization } from '@/collections/Donations/hooks/processDonationToOrganization';
import { createdByField } from '@/fields/createdByField';
import { deliveryTab } from '@/fields/deliveryTab';
import { statusTimeStamps } from '@/fields/statusTimeStamps';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { initStatusOnRecipient } from '@/hooks/collections/initStatusOnRecipient';
import {
  COLLECTION_GROUP,
  COLLECTION_MODES,
  DONATION_REQUEST_STATUS,
  STORAGE_TYPES,
} from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { donationsEndpoints } from './endpoints';
import { filterMilkBagsOptions } from './filterOptions';
import { createDonationNotification } from './hooks/createNotification';
import { generateTitle } from './hooks/generateTitle';
import { initializeDonation } from './hooks/initialize';

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
    beforeValidate: [initializeDonation],
    beforeChange: [initStatusOnRecipient, generateCreatedBy, generateTitle],
    afterChange: [createDonationNotification, processDonationToOrganization],
  },
  endpoints: donationsEndpoints,
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
          name: 'donor',
          type: 'relationship',
          relationTo: 'individuals',
          required: true,
          admin: {
            description: 'The person donating the milk',
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
              'Intended recipient for this donation (optional - leave empty for general donation)',
            width: '50%',
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Donation Status',
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
