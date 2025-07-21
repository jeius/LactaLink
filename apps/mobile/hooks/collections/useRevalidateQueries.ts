import { COLLECTION_QUERY_KEY, INFINITE_QUERY_KEY, QUERY_KEYS } from '@/lib/constants';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useRevalidateQueries() {
  const queryClient = useQueryClient();

  const revalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [...COLLECTION_QUERY_KEY, ...INFINITE_QUERY_KEY, QUERY_KEYS.AUTH.USER],
    });
  }, [queryClient]);

  return revalidateQueries;
}
