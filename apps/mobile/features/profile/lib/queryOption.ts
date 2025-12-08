import { QUERY_KEYS } from '@/lib/constants';
import { PopulatedUserProfile } from '@lactalink/types';
import { extractID } from '@lactalink/utilities/extractors';
import { infiniteQueryOptions } from '@tanstack/react-query';
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
