import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';

export const Provinces: CollectionConfig<'provinces'> = {
  slug: 'provinces',
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'region'],
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
