import { INFINITE_QUERY_KEY } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import { CollectionSlug, FindArgs } from '@lactalink/types';
import { useInfiniteQuery } from '@tanstack/react-query';

export type InfiniteFetchOptions<T extends CollectionSlug> = Pick<
  FindArgs<T, true>,
  'depth' | 'where' | 'sort' | 'select' | 'limit'
>;

export function useInfiniteFetchBySlug<TSlug extends CollectionSlug>(
  collection: TSlug,
  enabled: boolean,
  options: InfiniteFetchOptions<TSlug> = {}
) {
  const apiClient = useApiClient();

  return useInfiniteQuery({
    enabled,
    queryKey: [...INFINITE_QUERY_KEY, collection, JSON.stringify(options)],
    queryFn: ({ pageParam }) =>
      apiClient.find({
        collection,
        page: pageParam,
        pagination: true,
        depth: 3,
        limit: 10,
        ...options,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
