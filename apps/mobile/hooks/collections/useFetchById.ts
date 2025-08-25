import { COLLECTION_QUERY_KEY } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import { CollectionSlug, FindOne, FindOneResult, SelectFromCollectionSlug } from '@lactalink/types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

export type FetchOptions<
  T extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<T>,
> = Partial<FindOne<T, TSelect>>;

export function useFetchById<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
>(
  enabled: boolean = true,
  options: FetchOptions<TSlug, TSelect> = {}
): UseQueryResult<FindOneResult<TSlug, TSelect> | null> {
  const apiClient = useApiClient();
  const { id, collection } = options;

  return useQuery({
    enabled,
    queryKey: [...COLLECTION_QUERY_KEY, collection, id, options],
    queryFn: () => {
      if (!id || !collection) return null;

      return apiClient.findByID({
        collection,
        id,
        depth: 3,
        ...options,
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
