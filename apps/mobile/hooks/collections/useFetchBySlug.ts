import { COLLECTION_QUERY_KEY } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import { FindMany, FindManyResult } from '@lactalink/types/api';
import { CollectionSlug, SelectFromCollectionSlug } from '@lactalink/types/payload-types';
import { MarkOptional } from '@lactalink/types/utils';
import { UndefinedInitialDataOptions, useQuery, UseQueryResult } from '@tanstack/react-query';

export type FetchBySlugOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
> = Omit<FindMany<TSlug, TSelect, false>, 'page' | 'pagination'>;

export type FetchBySlugQueryOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
> = MarkOptional<
  UndefinedInitialDataOptions<FindManyResult<TSlug, TSelect, false>>,
  'queryFn' | 'queryKey' | 'enabled'
>;

/**
 * Fetch data from a collection by its slug using react-query.
 * @param enabled Set to false to disable the query from automatically running
 * @param apiOptions Api fetch options for fetching data
 * @param queryOptions Overrides for the react-query options
 * @returns A react-query object with the data, error, and status of the query
 */
export function useFetchBySlug<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
>(
  enabled: boolean,
  apiOptions: FetchBySlugOptions<TSlug, TSelect>,
  queryOptions?: FetchBySlugQueryOptions<TSlug, TSelect>
): UseQueryResult<FindManyResult<TSlug, TSelect, false>> {
  const apiClient = useApiClient();
  const { collection, depth = 3, ...rest } = apiOptions;

  // If no where condition is provided, set a high limit to avoid fetching all items
  if (!rest.where) {
    rest.limit = 1000; // default limit to 1000
  }

  return useQuery({
    enabled,
    queryKey: [...COLLECTION_QUERY_KEY, collection, apiOptions],
    queryFn: () => {
      if (!collection) throw new Error('Collection is required');

      return apiClient.find<TSlug, TSelect, false>({
        collection,
        pagination: false,
        depth,
        ...rest,
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...queryOptions,
  });
}
