import { createdByField } from '@/fields/createdByField';
import { deliveryTabFields } from '@/fields/deliveryTabFields';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { filterMilkBagsOptions } from './filterOptions';
import { createDonationNotification } from './hooks/createNotification';
import { generateTitle } from './hooks/generateTitle';
import { initialize } from './hooks/initialize';
import { updateStatus } from './hooks/updateStatus';

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
    beforeChange: [initialize, generateCreatedBy, generateTitle, updateStatus],
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
          defaultValue: 'AVAILABLE',
          options: [
            { label: 'Available', value: 'AVAILABLE' },
            { label: 'Partially Allocated', value: 'PARTIALLY_ALLOCATED' },
            { label: 'Fully Allocated', value: 'FULLY_ALLOCATED' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Expired', value: 'EXPIRED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ],
        },
      ],
    },

    {
      name: 'matchedRequests',
      label: 'Matched Requests',
      type: 'join',
      on: 'matchedDonation',
      collection: 'requests',
      defaultSort: '-createdAt',
      maxDepth: 1,
      admin: {
        description: 'The requests that this donation fulfills',
        defaultColumns: ['title', 'status'],
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
                      options: [
                        { label: 'Fresh (Refrigerated)', value: 'FRESH' },
                        { label: 'Frozen', value: 'FROZEN' },
                      ],
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
                      options: [
                        { label: 'Hand Expression', value: 'MANUAL' },
                        { label: 'Electric Pump', value: 'ELECTRIC_PUMP' },
                        { label: 'Manual Pump', value: 'MANUAL_PUMP' },
                      ],
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
              type: 'group',
              fields: [
                ...deliveryTabFields({ defaultPreferredModes: ['PICKUP'] }),
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
    },
  ],
};
