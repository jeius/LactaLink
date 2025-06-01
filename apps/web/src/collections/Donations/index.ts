import { createdByField } from '@/fields/createdByField';
import { deliveryTabFields } from '@/fields/deliveryTabFields';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { generateTitle } from './hooks/generateTitle';

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
    defaultColumns: ['donor', 'amount', 'remainingAmount', 'status', 'createdAt'],
  },
  hooks: {
    beforeChange: [generateCreatedBy, generateTitle],
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
      type: 'row',
      fields: [
        {
          name: 'volume',
          label: 'Total Volume (mL)',
          type: 'number',
          required: true,
          defaultValue: 50,
          min: 20,
          admin: {
            description: 'Total volume of milk available for donation',
          },
        },
        {
          name: 'remainingVolume',
          label: 'Remaining Volume (mL)',
          type: 'number',
          admin: {
            description: 'Volume still available for allocation',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'matchedRequests',
      type: 'join',
      on: 'matchedDonation',
      collection: 'requests',
      hasMany: true,
      admin: {
        description: 'The requests that this donation fulfills',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'details',
          label: 'Milk Details',
          fields: [
            {
              name: 'collectedAt',
              label: 'Date Collected',
              type: 'date',
              required: true,
              admin: {
                description: 'Date when the milk was collected',
              },
            },
            {
              name: 'expiresAt',
              label: 'Expiration Date',
              type: 'date',
              admin: {
                description: 'Date when the milk expires',
              },
            },
            {
              name: 'storageType',
              label: 'Storage Type',
              type: 'select',
              required: true,
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
              options: [
                { label: 'Hand Expression', value: 'MANUAL' },
                { label: 'Electric Pump', value: 'ELECTRIC_PUMP' },
                { label: 'Manual Pump', value: 'MANUAL_PUMP' },
              ],
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
        {
          name: 'deliveryDetails',
          label: 'Delivery Details',
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
};
