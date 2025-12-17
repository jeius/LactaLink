import { getApiClient } from '@lactalink/api';
import { Request } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { queryOptions } from '@tanstack/react-query';

export function createRequestQuery(doc: string | Request | undefined) {
  const docID = extractID(doc);
  return queryOptions({
    enabled: !!doc,
    queryKey: ['requests', docID],
    queryFn: () => {
      if (!docID) throw new Error('Request ID is required to fetch request.');

      const apiClient = getApiClient();
      return apiClient.findByID({
        collection: 'requests',
        id: docID,
        depth: 3,
        joins: { transactions: { count: true, limit: 0 } },
      });
    },
    initialData: extractCollection(doc) || undefined,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
