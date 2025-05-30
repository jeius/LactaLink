import { createdByField } from '@/fields/createdByField';
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
    defaultColumns: ['title', 'donor', 'createdBy', 'createdAt'],
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
      name: 'donor',
      type: 'relationship',
      relationTo: 'individuals',
      required: true,
      admin: {
        description: 'The person donating the milk',
      },
    },
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'individuals',
      admin: {
        description: 'The person receiving the milk',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'milkDetails',
          label: 'Milk Details',
          fields: [
            {
              name: 'amount',
              label: 'Amount (mL)',
              type: 'number',
              required: true,
              min: 1,
              admin: {
                description: 'Amount of milk in milliliters',
              },
            },
            {
              name: 'collectionDate',
              label: 'Collection Date',
              type: 'date',
              required: true,
              admin: {
                description: 'Date when the milk was collected',
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
              admin: {
                description: 'Upload images of the milk sample',
              },
            },
          ],
        },
        {
          name: 'deliveryDetails',
          label: 'Delivery Details',
          fields: [
            {
              name: 'deliveryMode',
              label: 'Delivery Mode',
              type: 'select',
              required: true,
              options: [
                { label: 'Pickup', value: 'PICKUP' },
                { label: 'Delivery', value: 'DELIVERY' },
                { label: 'Meet-up', value: 'MEETUP' },
              ],
            },
            {
              name: 'deliveryAddress',
              label: 'Delivery/Pickup Address',
              type: 'relationship',
              relationTo: 'addresses',
              admin: {
                description: 'Address for pickup, delivery, or meet-up',
              },
            },
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'PENDING',
              options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Rejected', value: 'REJECTED' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Cancelled', value: 'CANCELLED' },
              ],
            },
            {
              name: 'urgency',
              type: 'select',
              defaultValue: 'MEDIUM',
              options: [
                { label: 'Low', value: 'LOW' },
                { label: 'Medium', value: 'MEDIUM' },
                { label: 'High', value: 'HIGH' },
                { label: 'Critical', value: 'CRITICAL' },
              ],
            },
            {
              name: 'notes',
              type: 'textarea',
              admin: {
                description: 'Additional notes or special instructions',
              },
            },
            {
              name: 'rejectionReason',
              label: 'Rejection Reason',
              type: 'textarea',
              admin: {
                condition: (data) => data.status === 'REJECTED',
                description: 'Reason for rejection (if applicable)',
              },
            },
          ],
        },
      ],
    },
  ],
};
