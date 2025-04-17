import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';

export const CitiesMunicipalities: CollectionConfig<'citiesMunicipalities'> = {
  slug: 'citiesMunicipalities',
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
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
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
      required: true,
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
