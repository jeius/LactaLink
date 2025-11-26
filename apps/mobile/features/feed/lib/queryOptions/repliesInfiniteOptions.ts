import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { Comment } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { infiniteQueryOptions } from '@tanstack/react-query';
import { REPLIES_LIMIT } from '../constants';

export function createRepliesInfiniteOptions(
  parentCommentID: Comment['id'],
  enabled: boolean = true
) {
  return infiniteQueryOptions({
    enabled: enabled,
    initialPageParam: 1,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryKey: ['replies', 'infinite', parentCommentID],
    queryFn: fetchReplies(parentCommentID),
    getNextPageParam: (page) => page.nextPage,
    getPreviousPageParam: (page) => page.prevPage,
  });
}

function fetchReplies(parentCommentID: Comment['id']) {
  return async ({ pageParam }: { pageParam: number }) => {
    const api = getApiClient();
    const meUser = getMeUser();
    const meProfile = meUser?.profile;

    if (!meProfile) {
      throw new Error('Unable to fetch comments: No profile found for current user.');
    }

    const { docs, ...rest } = await api.find({
      collection: 'comments',
      page: pageParam,
      limit: REPLIES_LIMIT,
      sort: 'createdAt',
      depth: 5,
      pagination: true,
      where: { parent: { equals: parentCommentID } },
      populate: {
        likes: { createdBy: true },
      },
      joins: {
        replies: false,
        likes: {
          count: true,
          where: {
            and: [
              { 'createdBy.relationTo': { equals: meProfile?.relationTo || '' } },
              { 'createdBy.value': { equals: extractID(meProfile?.value) || '' } },
            ],
          },
        },
      },
    });

    const map = new Map(docs.map((d) => [d.id, d]));
    return { docs: map, ...rest };
  };
}
