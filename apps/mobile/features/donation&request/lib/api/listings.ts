import { getApiClient } from '@/lib/services';
import { getMeUser } from '@/lib/stores/meUserStore';
import { CollectionSlug } from '@lactalink/types/payload-types';

export function getMyListings(
  {
    collection,
    page,
    limit = 10,
  }: {
    collection: Extract<CollectionSlug, 'donations' | 'requests'>;
    page: number;
    limit?: number;
  },
  init?: RequestInit
) {
  const meUser = getMeUser();
  if (!meUser) throw new Error('User must be logged in to fetch their listings');
  return getApiClient().find(
    {
      collection: collection,
      where: { createdBy: { equals: meUser.id } },
      pagination: true,
      page: page,
      limit: limit,
      depth: 2,
    },
    init
  );
}
