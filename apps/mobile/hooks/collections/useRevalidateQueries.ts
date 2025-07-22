import { COLLECTION_QUERY_KEY, INFINITE_QUERY_KEY, QUERY_KEYS } from '@/lib/constants';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useRevalidateQueries() {
  const queryClient = useQueryClient();

  const revalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({
      predicate(query) {
        return [...COLLECTION_QUERY_KEY, ...INFINITE_QUERY_KEY, ...QUERY_KEYS.AUTH.USER].some(
          (key) => query.queryKey.includes(key)
        );
      },
    });
  }, [queryClient]);

  return revalidateQueries;
}
