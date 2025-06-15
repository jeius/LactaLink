import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../../_access-control';

export const CitiesMunicipalities: CollectionConfig<'citiesMunicipalities'> = {
  slug: 'citiesMunicipalities',
  typescript: { interface: 'CityMunicipality' },
  labels: {
    plural: 'Cities/Municipalities',
    singular: 'City/Municipality',
  },
  access: {
    admin: admin,
    read: authenticated,
    create: admin,
    update: admin,
    delete: admin,
  },
  admin: {
    group: COLLECTION_GROUP.PSGC,
    description:
      'Cities and municipalities in the Philippines, including their details such as name, code, type, and associated regions.',
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
      defaultValue: 'NONE',
      options: [
        { label: 'None', value: 'NONE' },
        { label: 'City', value: 'CITY' },
        { label: 'Municipality', value: 'MUNICIPALITY' },
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
