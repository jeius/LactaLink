import { COLLECTION_QUERY_KEY } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import { CollectionSlug, FindByIDArgs } from '@lactalink/types';
import { useQuery } from '@tanstack/react-query';

export type FetchOptions<T extends CollectionSlug> = Pick<
  FindByIDArgs<T>,
  'depth' | 'where' | 'select'
>;

export function useFetchById<TSlug extends CollectionSlug>(
  id: string,
  collection: TSlug,
  enabled: boolean = true,
  options: FetchOptions<TSlug> = {}
) {
  const apiClient = useApiClient();

  return useQuery({
    enabled,
    queryKey: [...COLLECTION_QUERY_KEY, collection, id, JSON.stringify(options)],
    queryFn: () =>
      apiClient.findByID({
        collection,
        id,
        depth: 3,
        ...options,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
