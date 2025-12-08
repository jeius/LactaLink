import { getApiClient } from '@lactalink/api';
import { UserProfile } from '@lactalink/types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { queryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants/queryKeys';

export function createUserProfileQuery(profile: UserProfile | undefined) {
  const profileDoc = extractCollection(profile?.value) ?? undefined;
  const slug = profile?.relationTo;
  const id = extractID(profile?.value);
  return queryOptions({
    enabled: !!id && !!slug,
    queryKey: [...QUERY_KEYS.PROFILE.ONE, id, slug],
    queryFn: () => {
      if (!id || !slug) throw new Error('Invalid profile data');

      const apiClient = getApiClient();
      return apiClient.findByID({
        collection: slug,
        id: id,
        depth: 5,
        joins: {
          inventory: { count: true, limit: 0 },
          posts: { count: true, limit: 0 },
          milkBags: { count: true, limit: 0 },
          receivedTransactions: { count: true, limit: 0 },
          sentTransactions: { count: true, limit: 0 },
        },
      });
    },
    placeholderData: (prev) => {
      if (!prev) return profileDoc;
      return prev;
    },
  });
}
