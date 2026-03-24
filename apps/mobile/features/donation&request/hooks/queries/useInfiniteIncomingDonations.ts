import { Donation, User } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addDonationToCache } from '../../lib/cacheUtils';
import { createIncomingDonationsInfQuery } from '../../lib/queryOptions/donations';

export function useInfiniteIncomingDonations(user: User | null | undefined) {
  const queryClient = useQueryClient();
  const { data: docs, ...query } = useInfiniteQuery(createIncomingDonationsInfQuery(user));

  const { arrayDocs, mappedDocs, unreadCount } = useMemo(() => {
    if (!docs)
      return {
        arrayDocs: [],
        mappedDocs: new Map<string, Donation>(),
        unreadCount: 0,
      };

    const arrayDocs: Donation[] = [];
    const mappedDocs: Map<string, Donation> = new Map();
    let unreadCount = 0;

    for (const page of docs.pages) {
      page.docs.forEach((doc) => {
        // Only add to cache and map if not placeholder data
        if (!query.isPlaceholderData) {
          // Also keep track in the map
          mappedDocs.set(doc.id, doc);
          // Add to cache as well
          addDonationToCache(queryClient, doc);
          // Check if unread
          if ((doc.reads?.docs?.length || 0) === 0) {
            unreadCount += 1;
          }
        }
        // Push each doc into the array
        arrayDocs.push(doc);
      });
    }

    return { arrayDocs, mappedDocs, unreadCount };
  }, [docs, query.isPlaceholderData, queryClient]);

  return { ...query, data: arrayDocs, dataMap: mappedDocs, unreadCount };
}
