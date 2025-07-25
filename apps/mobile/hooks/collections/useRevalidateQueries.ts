import { COLLECTION_QUERY_KEY, INFINITE_QUERY_KEY, QUERY_KEYS } from '@/lib/constants';
import { CollectionSlug } from '@lactalink/types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useRevalidateQueries() {
  const queryClient = useQueryClient();

  const revalidate = useCallback(
    (select: 'all' | 'collections' | 'user' = 'all') => {
      const keysToInvalidate = {
        all: [...COLLECTION_QUERY_KEY, ...INFINITE_QUERY_KEY, ...QUERY_KEYS.AUTH.USER],
        collections: [...COLLECTION_QUERY_KEY, ...INFINITE_QUERY_KEY],
        user: QUERY_KEYS.AUTH.USER,
      }[select];

      if (!keysToInvalidate) return;

      queryClient.invalidateQueries({
        predicate(query) {
          return keysToInvalidate.some((key) => query.queryKey.includes(key));
        },
      });
    },
    [queryClient]
  );

  return revalidate;
}

export function useRevalidateCollectionQueries(collectionSlug: CollectionSlug) {
  const queryClient = useQueryClient();

  const revalidate = useCallback(() => {
    queryClient.invalidateQueries({
      predicate(query) {
        const willInvalidate = [
          ...COLLECTION_QUERY_KEY,
          ...INFINITE_QUERY_KEY,
          collectionSlug,
        ].some((key) => query.queryKey.includes(key));

        return willInvalidate;
      },
    });
  }, [queryClient, collectionSlug]);

  return revalidate;
}
