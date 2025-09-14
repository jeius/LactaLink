import { getApiClient } from '@lactalink/api';
import { CollectionSlug } from '@lactalink/types/payload-types';

type Slug = Extract<CollectionSlug, 'donations' | 'notifications' | 'requests' | 'transactions'>;

export function markSeen<T extends Slug>(collection: T, id: string | string[]) {
  const apiClient = getApiClient();
  const ids = Array.isArray(id) ? id : [id];
  const now = new Date().toISOString();

  if (!ids.length) return Promise.resolve(undefined);

  return apiClient.update({
    collection,
    data: { seenAt: now, seen: true },
    where: { id: { in: ids } },
    depth: 3,
  });
}
