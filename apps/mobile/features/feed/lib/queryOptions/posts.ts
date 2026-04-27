import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import { getStoredInfiniteDocuments } from '@/lib/localStorage/utils';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { Post } from '@lactalink/types/payload-generated-types';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { getPostByID, getPublishedPosts } from '../api/posts';
import { STORED_POSTS_KEY } from '../constants';

const STORAGE_KEY = STORED_POSTS_KEY;

export function createPostInfQuery() {
  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: QUERY_KEYS.POSTS.INFINITE,
    queryFn: async ({ pageParam, signal }) => {
      const paginatedDocs = await getPublishedPosts({ page: pageParam }, { signal });
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (page) => page.nextPage,
    getPreviousPageParam: (page) => page.prevPage,
    placeholderData: (prevData) => {
      if (prevData) return prevData;
      const stored = getStoredInfiniteDocuments<Post>(STORAGE_KEY);
      if (stored) return stored;
      return generatePlaceHoldersForInfQueries(15);
    },
  });
}

export function createPostQueryOptions(id: Post['id'], initialData?: Post) {
  return queryOptions({
    queryKey: [...QUERY_KEYS.POSTS.ONE, id],
    queryFn: async ({ signal }) => getPostByID(id, { signal }),
    placeholderData: (prev) => {
      if (prev) return prev;
      return initialData;
    },
  });
}
