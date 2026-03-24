import { Request, User } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addRequestToCache } from '../../lib/cacheUtils';
import { createIncomingRequestsInfQuery } from '../../lib/queryOptions/request';

export function useInfiniteIncomingRequests(user: User | null | undefined) {
  const queryClient = useQueryClient();
  const { data: docs, ...query } = useInfiniteQuery(createIncomingRequestsInfQuery(user));

  const { arrayDocs, mappedDocs, unreadCount } = useMemo(() => {
    if (!docs)
      return {
        arrayDocs: [],
        mappedDocs: new Map<string, Request>(),
        unreadCount: 0,
      };

    const arrayDocs: Request[] = [];
    const mappedDocs: Map<string, Request> = new Map();
    let unreadCount = 0;

    for (const page of docs.pages) {
      page.docs.forEach((doc) => {
        // Only add to cache and map if not placeholder data
        if (!query.isPlaceholderData) {
          // Also keep track in the map
          mappedDocs.set(doc.id, doc);
          // Add to cache as well
          addRequestToCache(queryClient, doc);
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
