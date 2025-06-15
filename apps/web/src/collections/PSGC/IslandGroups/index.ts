import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin, authenticated } from '../../_access-control';

export const IslandGroups: CollectionConfig<'islandGroups'> = {
  slug: 'islandGroups',
  admin: {
    group: COLLECTION_GROUP.PSGC,
    description:
      'Island groups in the Philippines, which are collections of islands that share geographical and cultural characteristics.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'code'],
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
  ],
};
