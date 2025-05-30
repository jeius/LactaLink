import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../_access-control';

export const Regions: CollectionConfig<'regions'> = {
  slug: 'regions',
  admin: {
    group: COLLECTION_GROUP.PSGC,
    description:
      'Regions in the Philippines, which are administrative divisions that group provinces and cities/municipalities.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'islandGroup'],
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
      name: 'regionName',
      type: 'text',
    },
    {
      name: 'islandGroup',
      type: 'relationship',
      relationTo: 'islandGroups',
      required: true,
    },
  ],
};
