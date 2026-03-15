import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { PopulatedUserProfile, UserProfile } from '@lactalink/types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { getPaginatedUserPosts } from './api/getPaginatedUserPosts';

export function createInfiniteUserPostsQuery(profile: PopulatedUserProfile) {
  const userID = extractID(profile.value.owner);

  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.POSTS.INFINITE, userID],
    queryFn: async ({ pageParam = 1 }) => {
      const { docs, ...rest } = await getPaginatedUserPosts(profile, pageParam);

      const docMap = new Map(docs.map((doc) => [extractID(doc), doc]));

      return { docs: docMap, ...rest };
    },
    getNextPageParam: ({ nextPage }) => nextPage,
    getPreviousPageParam: ({ prevPage }) => prevPage,
  });
}

export function createUserProfileQuery(profile: UserProfile | undefined) {
  const profileDoc = extractCollection(profile?.value) ?? undefined;
  const slug = profile?.relationTo;
  const id = extractID(profile?.value);
  return queryOptions({
    enabled: !!id && !!slug,
    queryKey: [...QUERY_KEYS.PROFILE.ONE, id, slug],
    queryFn: async (): Promise<PopulatedUserProfile> => {
      if (!id || !slug) throw new Error('User has no profile to fetch.');

      const apiClient = getApiClient();
      const data =
        slug === 'individuals'
          ? await apiClient.findByID({
              collection: slug,
              id: id,
              depth: 3,
              joins: { posts: { count: true, limit: 10 } },
            })
          : await apiClient.findByID({
              collection: slug,
              id: id,
              depth: 3,
              joins: {
                inventory: { count: true, limit: 0 },
                posts: { count: true, limit: 0 },
                milkBags: { count: true, limit: 0 },
                receivedTransactions: { count: true, limit: 0 },
                sentTransactions: { count: true, limit: 0 },
              },
            });

      return { relationTo: slug, value: data } as PopulatedUserProfile;
    },
    placeholderData: (prev) => {
      if (!prev && slug && profileDoc)
        return { relationTo: slug, value: profileDoc } as PopulatedUserProfile;
      return prev;
    },
  });
}
