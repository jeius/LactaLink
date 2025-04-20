import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';

export const Barangays: CollectionConfig<'barangays'> = {
  slug: 'barangays',
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'cityMunicipality'],
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
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'subMunicipalityCode',
      type: 'text',
    },
    {
      name: 'districtCode',
      type: 'text',
    },
    {
      name: 'cityMunicipality',
      type: 'relationship',
      label: 'City/Municipality',
      relationTo: 'citiesMunicipalities',
      required: true,
      maxDepth: 0,
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
