import { COLLECTION_QUERY_KEY } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import { CollectionSlug, FindArgs } from '@lactalink/types';
import { useQuery } from '@tanstack/react-query';

export type FetchOptions<T extends CollectionSlug> = Omit<
  Partial<FindArgs<T, true>>,
  'page' | 'pagination'
>;

export function useFetchBySlug<TSlug extends CollectionSlug>(
  enabled: boolean,
  options: FetchOptions<TSlug> = {}
) {
  const apiClient = useApiClient();
  const { collection } = options;

  return useQuery({
    enabled,
    queryKey: [...COLLECTION_QUERY_KEY, collection, JSON.stringify(options)],
    queryFn: () => {
      if (!collection) return null;
      return apiClient.find({
        collection,
        pagination: false,
        depth: 3,
        limit: 10,
        ...options,
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
