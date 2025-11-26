import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { infiniteQueryOptions } from '@tanstack/react-query';

export function createCommentsInfiniteOptions(postID: Post['id'], enabled: boolean = true) {
  return infiniteQueryOptions({
    enabled: enabled,
    initialPageParam: 1,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryKey: ['comments', 'infinite', postID],
    queryFn: fetchComments(postID),
    getNextPageParam: (page) => page.nextPage,
    getPreviousPageParam: (page) => page.prevPage,
  });
}

function fetchComments(postID: Post['id']) {
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
      limit: 10,
      sort: '-createdAt',
      depth: 5,
      where: {
        and: [{ post: { equals: postID } }, { parent: { exists: false } }],
      },
      pagination: true,
      populate: {
        likes: { createdBy: true },
      },
      joins: {
        replies: { count: true, sort: '-createdAt', limit: 4 },
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
