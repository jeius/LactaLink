import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';

export const CitiesMunicipalities: CollectionConfig<'citiesMunicipalities'> = {
  slug: 'citiesMunicipalities',
  typescript: { interface: 'CityMunicipality' },
  labels: {
    plural: 'Cities/Municipalities',
    singular: 'City/Municipality',
  },
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'province'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'oldName',
      type: 'text',
    },
    {
      name: 'isCapital',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'type',
      type: 'radio',
      required: true,
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'City', value: 'city' },
        { label: 'Municipality', value: 'municipality' },
      ],
    },
    {
      name: 'districtCode',
      type: 'text',
    },
    {
      name: 'province',
      type: 'relationship',
      relationTo: 'provinces',
      maxDepth: 0,
    },
    {
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
      required: true,
      maxDepth: 0,
    },
    {
      name: 'islandGroup',
      type: 'relationship',
      relationTo: 'islandGroups',
      required: true,
      maxDepth: 0,
    },
  ],
};
