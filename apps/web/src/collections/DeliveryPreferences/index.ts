import { createdByField } from '@/fields/createdByField';
import { ownerField } from '@/fields/ownerField';

import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { generateOwner } from '@/hooks/collections/generateOwner';

import { COLLECTION_GROUP, DAYS, DELIVERY_OPTIONS } from '@/lib/constants';

import { CollectionConfig } from 'payload';

import { authenticated, collectionOwnerOrAdmin } from '../_access-control';
import { addressFilterOptions } from './filterOptions';
import { generateName } from './hooks/generateName';

export const DeliveryPreferences: CollectionConfig<'delivery-preferences'> = {
  slug: 'delivery-preferences',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['owner', 'name', 'preferredMode', 'address', 'availableDays'],
    group: COLLECTION_GROUP.DONATIONS,
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: collectionOwnerOrAdmin,
    delete: collectionOwnerOrAdmin,
  },
  hooks: {
    beforeChange: [generateCreatedBy, generateOwner, generateName],
  },
  fields: [
    createdByField,
    ownerField,
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      hasMany: false,
      validate: () => true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'preferredMode',
          label: 'Preferred Delivery Modes',
          type: 'select',
          enumName: 'enum_delivery_modes',
          hasMany: true,
          required: true,
          options: Object.values(DELIVERY_OPTIONS),
          admin: {
            width: '50%',
            description:
              'Preferred delivery modes of the individual. This will be used for matching.',
          },
        },
        {
          name: 'address',
          label: 'Address',
          type: 'relationship',
          relationTo: 'addresses',
          hasMany: false,
          required: true,
          filterOptions: addressFilterOptions,
          admin: {
            width: '50%',
            description: 'Address available for pickup, delivery, or meet-up.',
          },
        },
        {
          name: 'availableDays',
          label: 'Available Days',
          type: 'select',
          enumName: 'enum_days',
          hasMany: true,
          required: true,
          defaultValue: Object.values(DAYS).map((day) => day.value),
          options: Object.values(DAYS),
          admin: {
            description: 'Days available for pickup, delivery, or meet-up.',
          },
        },
      ],
    },
    {
      name: 'donations',
      label: 'Related Donations',
      type: 'join',
      on: 'deliveryDetails',
      collection: 'donations',
      admin: {
        defaultColumns: ['donor', 'remainingVolume', 'status'],
      },
    },
    {
      name: 'requests',
      label: 'Related Requests',
      type: 'join',
      on: 'deliveryDetails',
      collection: 'requests',
      admin: {
        defaultColumns: ['requester', 'volumeNeeded', 'status'],
      },
    },
  ],
};
