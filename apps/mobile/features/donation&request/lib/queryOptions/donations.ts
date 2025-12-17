import { getApiClient } from '@lactalink/api';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { queryOptions } from '@tanstack/react-query';

export function createDonationQuery(doc: string | Donation | undefined) {
  const docID = extractID(doc);
  return queryOptions({
    enabled: !!doc,
    queryKey: ['donations', docID],
    queryFn: () => {
      if (!docID) throw new Error('Donation ID is required to fetch donation.');

      const apiClient = getApiClient();
      return apiClient.findByID({
        collection: 'donations',
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
