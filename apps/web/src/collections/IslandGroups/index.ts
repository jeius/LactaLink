import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';

export const IslandGroups: CollectionConfig<'islandGroups'> = {
  slug: 'islandGroups',
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'name',
    defaultColumns: ['name', 'code'],
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
  ],
};
