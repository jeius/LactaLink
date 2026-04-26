import { QUERY_KEYS } from '@/lib/constants';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { transformToInfiniteDataMap } from '@/lib/utils/transformToInfiniteData';
import { Post } from '@lactalink/types/payload-generated-types';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions } from '@tanstack/react-query';
import { getPaginatedComments, getPaginatedReplies } from '../api/comments';

export function createCommentsInfQuery(
  postID: string | null | undefined,
  initialData?: Post['comments']
) {
  return infiniteQueryOptions({
    initialPageParam: 1,
    enabled: !!postID,
    queryKey: [...QUERY_KEYS.POSTS.COMMENTS.INFINITE, postID],
    queryFn: async ({ pageParam, signal }) => {
      if (!postID) {
        throw new Error('Post ID is required to fetch comments.');
      }

      const paginatedDocs = await getPaginatedComments({ postID, page: pageParam }, { signal });
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (page) => page.nextPage,
    getPreviousPageParam: (page) => page.prevPage,
    placeholderData: (prev) => {
      if (prev) return prev;
      if (initialData) return transformToInfiniteDataMap(initialData);
      return generatePlaceHoldersForInfQueries(10);
    },
  });
}

export function createRepliesInfQuery(commentID: string | null | undefined, enabled = true) {
  return infiniteQueryOptions({
    enabled: !!commentID && enabled,
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.POSTS.REPLIES.INFINITE, commentID],
    queryFn: async ({ pageParam, signal }) => {
      if (!commentID) {
        throw new Error('A comment is required to fetch the replies.');
      }
      const paginatedDocs = await getPaginatedReplies({ commentID, page: pageParam }, { signal });
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (page) => page.nextPage,
    getPreviousPageParam: (page) => page.prevPage,
  });
}
