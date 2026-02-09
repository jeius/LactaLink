import { GEOCODE_SOURCES } from '@lactalink/enums/geocoding';
import { sanitizeStreetAddress } from '@lactalink/utilities/formatters';

import { CollectionConfig } from 'payload';

import { createUserField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants';
import { admin, authenticated, collectionOwnerOrAdmin } from '../_access-control';
import { ensureUniqueDefaultAddress } from './hooks/ensureUniqueDefaultAddress';
import { generateDisplayName } from './hooks/generateDisplayName';
import { generateIslandGroupAndRegion } from './hooks/generateIslandGroupAndRegion';
import { generateName } from './hooks/generateName';
import { preserveGeocodingMetadata } from './hooks/preserveGeocodingMetadata';

export const Addresses: CollectionConfig<'addresses'> = {
  slug: 'addresses',
  admin: {
    group: COLLECTION_GROUP.PROFILES,
    description:
      'Addresses of users, which are used to identify locations for various purposes such as shipping and identification.',
    useAsTitle: 'displayName',
    defaultColumns: ['name', 'displayName', 'default', 'owner'],
  },
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: collectionOwnerOrAdmin,
    delete: collectionOwnerOrAdmin,
  },
  hooks: {
    beforeChange: [generateDisplayName, generateIslandGroupAndRegion, preserveGeocodingMetadata],
    afterChange: [ensureUniqueDefaultAddress],
  },
  fields: [
    createUserField({ name: 'owner', required: true }),

    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: 'Address Label',
          type: 'text',
          admin: {
            description: 'e.g. Home, Workplace.',
            width: '50%',
          },
          hooks: { beforeChange: [generateName] },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'isDefault',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Set as default address.',
            width: '50%',
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'region',
          type: 'relationship',
          relationTo: 'regions',
          admin: {
            width: '50%',
            readOnly: true,
          },
        },
        {
          name: 'islandGroup',
          type: 'relationship',
          relationTo: 'islandGroups',
          admin: {
            width: '50%',
            readOnly: true,
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'province',
          type: 'relationship',
          relationTo: 'provinces',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'cityMunicipality',
          label: 'City/Municipality',
          type: 'relationship',
          relationTo: 'citiesMunicipalities',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'barangay',
          type: 'relationship',
          relationTo: 'barangays',
          admin: { width: '50%' },
        },
        {
          name: 'zipCode',
          label: 'Postal/Zip Code',
          type: 'text',
          admin: {
            description: 'Postal/Zip code of the address.',
            width: '50%',
          },
        },
      ],
    },

    {
      name: 'street',
      label: 'Street Address',
      type: 'text',
      hooks: {
        beforeValidate: [({ value }) => value && sanitizeStreetAddress(value)],
      },
    },

    {
      name: 'displayName',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Geocoding Metadata',
          fields: [
            {
              name: 'coordinates',
              type: 'point',
              admin: {
                position: 'sidebar',
              },
            },

            {
              name: 'geocodedAddress',
              label: 'Geocoded Address',
              type: 'text',
              admin: {
                position: 'sidebar',
                readOnly: true,
                description: 'Full formatted address returned by Google (for reference)',
              },
            },
            {
              name: 'geocodedComponents',
              label: 'Geocoded Components',
              type: 'json',
              admin: {
                position: 'sidebar',
                readOnly: true,
                description: 'Address components from Google Geocoding API',
              },
            },
            {
              name: 'geocodedAt',
              label: 'Geocoded At',
              type: 'date',
              admin: {
                position: 'sidebar',
                readOnly: true,
                description: 'Timestamp when the address was geocoded',
              },
            },
            {
              name: 'geocodeSource',
              label: 'Geocode Source',
              enumName: 'enum_geocode_source',
              type: 'select',
              options: Object.values(GEOCODE_SOURCES),
              admin: {
                position: 'sidebar',
                readOnly: true,
                description: 'Source of the geocoding data',
              },
            },
          ],
        },

        {
          label: 'Delivery Preferences',
          fields: [
            {
              name: 'deliveryPreferences',
              label: 'Related Delivery Preferences',
              type: 'join',
              on: 'address',
              collection: 'delivery-preferences',
            },
          ],
        },
      ],
    },
  ],
};
