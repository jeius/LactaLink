import { COLLECTION_QUERY_KEY } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import {
  CollectionSlug,
  FindMany,
  FindManyResult,
  SelectFromCollectionSlug,
} from '@lactalink/types';
import { UndefinedInitialDataOptions, useQuery, UseQueryResult } from '@tanstack/react-query';

export type FetchOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
> = Omit<Partial<FindMany<TSlug, TSelect, false>>, 'page' | 'pagination'>;

export function useFetchBySlug<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
>(
  enabled: boolean,
  options: FetchOptions<TSlug, TSelect> = {},
  queryOptions?: Omit<
    UndefinedInitialDataOptions<FindManyResult<TSlug, TSelect, false> | null>,
    'queryFn' | 'queryKey' | 'enabled'
  >
): UseQueryResult<FindManyResult<TSlug, TSelect, false> | null> {
  const apiClient = useApiClient();
  const { collection } = options;

  return useQuery({
    ...queryOptions,
    enabled,
    queryKey: [...COLLECTION_QUERY_KEY, collection, options],
    queryFn: () => {
      if (!collection) return null;
      return apiClient.find<TSlug, TSelect, false>({
        collection,
        pagination: false,
        depth: 3,
        ...options,
      });
    },
    staleTime: queryOptions?.staleTime || 1000 * 60 * 5, // 5 minutes
  });
}
