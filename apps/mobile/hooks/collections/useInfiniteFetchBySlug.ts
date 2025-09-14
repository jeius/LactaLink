import { INFINITE_QUERY_KEY } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import { FindMany, FindManyResult } from '@lactalink/types/api';
import { CollectionSlug, SelectFromCollectionSlug } from '@lactalink/types/payload-types';
import { MarkOptional } from '@lactalink/types/utils';
import {
  InfiniteData,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';

export type InfiniteFetchOptions<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = Omit<FindMany<TSlug, TSelect, true>, 'pagination'>;

export type InfiniteQueryOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
> = MarkOptional<
  UndefinedInitialDataInfiniteOptions<FindManyResult<TSlug, TSelect, true>>,
  | 'queryFn'
  | 'queryKey'
  | 'enabled'
  | 'getNextPageParam'
  | 'getPreviousPageParam'
  | 'initialPageParam'
>;

/**
 * Fetch paginated data from a collection by its slug using react-query.
 * @param enabled Set to false to disable the query from automatically running
 * @param apiOptions Api fetch options for fetching data
 * @param queryOptions Overrides for the react-query options
 * @returns A react-query object with paginated data, error, and status of the query
 */
export function useInfiniteFetchBySlug<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
>(
  enabled: boolean,
  apiOptions: InfiniteFetchOptions<TSlug, TSelect>,
  queryOptions?: InfiniteQueryOptions<TSlug, TSelect>
): UseInfiniteQueryResult<InfiniteData<FindManyResult<TSlug, TSelect, true>>> {
  const apiClient = useApiClient();
  const { collection, page = 0, depth = 3, limit = 15, ...rest } = apiOptions;

  return useInfiniteQuery({
    enabled,
    initialPageParam: page,
    queryKey: [...INFINITE_QUERY_KEY, collection, apiOptions],
    queryFn: ({ pageParam }) => {
      if (!collection) throw new Error('Collection is required');

      return apiClient.find<TSlug, TSelect, true>({
        collection,
        page: pageParam as number,
        pagination: true,
        depth,
        limit,
        ...rest,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextPage || null,
    getPreviousPageParam: (firstPage) => firstPage.prevPage || null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...queryOptions,
  });
}
