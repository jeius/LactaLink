import { createdByField } from '@/fields/createdByField';
import { deliveryTabFields } from '@/fields/deliveryTabFields';
import { priorityLevel } from '@/fields/priorityLevel';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorOrAdmin } from '../_access-control';
import { generateTitle } from './hooks/generateTitle';

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
    defaultColumns: ['requester', 'amount', 'status', 'createdAt'],
  },
  hooks: {
    beforeChange: [generateCreatedBy, generateTitle],
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
    createdByField,
    {
      name: 'requester',
      type: 'relationship',
      relationTo: 'individuals',
      required: true,
      admin: {
        description: 'The person requesting the milk',
      },
    },
    {
      name: 'volumeNeeded',
      label: 'Volume Needed (mL)',
      type: 'number',
      required: true,
      min: 20,
      admin: {
        description: 'Amount of milk needed in milliliters',
      },
    },
    {
      name: 'matchedDonation',
      type: 'relationship',
      relationTo: 'donations',
      admin: {
        description: 'The donation that fulfilled this request',
      },
    },
    {
      name: 'status',
      label: 'Request Status',
      type: 'select',
      required: true,
      defaultValue: 'PENDING',
      options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Matched', value: 'MATCHED' },
        { label: 'Fulfilled', value: 'FULFILLED' },
        { label: 'Cancelled', value: 'CANCELLED' },
        { label: 'Expired', value: 'EXPIRED' },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'details',
          label: 'Details',
          fields: [
            {
              name: 'neededAt',
              label: 'Date Needed',
              type: 'date',
              required: true,
              admin: {
                description: 'Date when the milk is needed',
              },
            },
            {
              name: 'storagePreference',
              label: 'Storage Preference',
              type: 'select',
              options: [
                { label: 'Fresh (Refrigerated)', value: 'FRESH' },
                { label: 'Frozen', value: 'FROZEN' },
                { label: 'Either', value: 'EITHER' },
              ],
              admin: {
                description: 'Preferred storage type',
              },
            },
            priorityLevel({
              name: 'urgency',
              defaultValue: 'LOW',
              label: 'Urgency Level',
            }),
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
        {
          name: 'deliveryDetails',
          label: 'Delivery Details',
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
};
