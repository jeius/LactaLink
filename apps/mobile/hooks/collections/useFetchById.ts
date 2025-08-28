import { COLLECTION_QUERY_KEY } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import {
  CollectionSlug,
  FindOne,
  FindOneResult,
  MarkOptional,
  SelectFromCollectionSlug,
} from '@lactalink/types';
import { UndefinedInitialDataOptions, useQuery, UseQueryResult } from '@tanstack/react-query';

export type FetchByIDOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
> = FindOne<TSlug, TSelect>;

export type FetchByIDQueryOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
> = MarkOptional<
  UndefinedInitialDataOptions<FindOneResult<TSlug, TSelect>>,
  'queryFn' | 'queryKey' | 'enabled'
>;

/**
 * Fetch data from a collection by its id and slug using react-query.
 * @param enabled Set to false to disable the query from automatically running
 * @param apiOptions Api fetch options for fetching data
 * @param queryOptions Overrides for the react-query options
 * @returns A react-query object with the data, error, and status of the query
 */
export function useFetchById<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
>(
  enabled: boolean = true,
  apiOptions: FetchByIDOptions<TSlug, TSelect>,
  queryOptions?: FetchByIDQueryOptions<TSlug, TSelect>
): UseQueryResult<FindOneResult<TSlug, TSelect>> {
  const apiClient = useApiClient();
  const { id, collection, depth = 3, ...rest } = apiOptions;

  return useQuery({
    enabled,
    queryKey: [...COLLECTION_QUERY_KEY, collection, id, apiOptions],
    queryFn: () => {
      if (!collection) throw new Error('Collection is required');
      if (!id) throw new Error('ID is required');

      return apiClient.findByID({
        collection,
        id,
        depth,
        ...rest,
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...queryOptions,
  });
}
