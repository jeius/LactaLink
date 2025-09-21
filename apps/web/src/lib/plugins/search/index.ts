import { Hospitals, Individuals, MilkBanks } from '@/collections';
import { admin, authenticated } from '@/collections/_access-control';
import { COLLECTION_GROUP } from '@/lib/constants';
import { searchPlugin } from '@payloadcms/plugin-search';
import { beforeSyncWithSearch } from './beforeSync';

export default searchPlugin({
  collections: [Individuals.slug, Hospitals.slug, MilkBanks.slug],
  beforeSync: beforeSyncWithSearch,
  searchOverrides: {
    slug: 'search',
    access: {
      create: admin,
      read: authenticated,
      update: admin,
      delete: admin,
      unlock: admin,
      readVersions: admin,
    },
    admin: { group: COLLECTION_GROUP.SYSTEM },
  },
});
