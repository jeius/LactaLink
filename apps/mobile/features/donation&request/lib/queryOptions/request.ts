import { getApiClient } from '@lactalink/api';
import { queryOptions } from '@tanstack/react-query';

export function createRequestQuery(id: string | undefined) {
  return queryOptions({
    enabled: !!id,
    queryKey: ['requests', id],
    queryFn: () => {
      if (!id) throw new Error('Request ID is required to fetch request.');

      const apiClient = getApiClient();
      return apiClient.findByID({
        collection: 'requests',
        id,
        depth: 3,
        joins: { transactions: { count: true, limit: 0 } },
      });
    },
  });
}
