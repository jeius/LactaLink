import { Hospitals, Individuals, MilkBanks } from '@/collections';
import { admin, authenticated } from '@/collections/_access-control';
import { COLLECTION_GROUP } from '@/lib/constants';
import { searchPlugin } from '@payloadcms/plugin-search';
import { beforeSyncWithSearch, populateDoc } from './hooks';

export default searchPlugin({
  collections: [Individuals.slug, Hospitals.slug, MilkBanks.slug],
  beforeSync: beforeSyncWithSearch,
  searchOverrides: {
    slug: 'user-search',
    labels: { singular: 'User Search', plural: 'User Searches' },
    access: {
      create: admin,
      read: authenticated,
      update: admin,
      delete: admin,
      unlock: admin,
      readVersions: admin,
    },
    hooks: {
      afterRead: [populateDoc],
    },
    admin: { group: COLLECTION_GROUP.SYSTEM },
    fields: ({ defaultFields }) => [
      ...defaultFields,
      {
        name: 'searchExcerpt',
        type: 'text',
      },
    ],
  },
});
