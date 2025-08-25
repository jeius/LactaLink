import { INFINITE_QUERY_KEY } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import {
  CollectionSlug,
  FindMany,
  FindManyResult,
  SelectFromCollectionSlug,
} from '@lactalink/types';
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';

export type InfiniteFetchOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = Pick<FindMany<TSlug, TSelect, true>, 'depth' | 'where' | 'sort' | 'select' | 'limit'>;

export function useInfiniteFetchBySlug<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
>(
  collection: TSlug,
  enabled: boolean,
  options: InfiniteFetchOptions<TSlug, TSelect> = {}
): UseInfiniteQueryResult<InfiniteData<FindManyResult<TSlug, TSelect, true>>> {
  const apiClient = useApiClient();

  return useInfiniteQuery({
    enabled,
    queryKey: [...INFINITE_QUERY_KEY, collection, options],
    queryFn: ({ pageParam }) =>
      apiClient.find<TSlug, TSelect, true>({
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
