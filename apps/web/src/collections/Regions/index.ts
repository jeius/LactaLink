import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';

export const Regions: CollectionConfig<'regions'> = {
  slug: 'regions',
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'islandGroup'],
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
