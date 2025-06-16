import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../../_access-control';

export const Provinces: CollectionConfig<'provinces'> = {
  slug: 'provinces',
  admin: {
    group: COLLECTION_GROUP.PSGC,
    description:
      'Provinces in the Philippines, which are administrative divisions that group cities and municipalities.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'region'],
  },
  access: {
    admin: admin,
    read: authenticated,
    create: admin,
    update: admin,
    delete: admin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
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
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
      required: true,
      maxDepth: 1,
    },
    {
      name: 'islandGroup',
      type: 'relationship',
      relationTo: 'islandGroups',
      required: true,
      maxDepth: 1,
    },
  ],
};
