import { COLLECTION_QUERY_KEY, INFINITE_QUERY_KEY, QUERY_KEYS } from '@/lib/constants';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useRevalidateAllQueries() {
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

/**
 * Revalidate queries for a specific collection or multiple collections.
 * @param collection Collection slug or array of slugs to revalidate
 * @returns Function to revalidate queries for the specified collection(s)
 */
export function useRevalidateCollectionQueries<T extends CollectionSlug>() {
  const queryClient = useQueryClient();

  const revalidate = useCallback(
    (collection: T | T[]) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const slugs = Array.isArray(collection) ? collection : [collection];
          return slugs.some((slug) => query.queryKey.includes(slug));
        },
      });
    },
    [queryClient]
  );

  return revalidate;
}
