import { useMeUser } from '@/hooks/auth/useAuth';
import { Donation, Request, User } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addDonationToCache, addRequestToCache } from '../lib/cacheUtils';
import {
  createDonationQuery,
  createIncomingDonationsInfQuery,
} from '../lib/queryOptions/donations';
import { createDraftMilkbagsQuery } from '../lib/queryOptions/milkbags';
import { createIncomingRequestsInfQuery, createRequestQuery } from '../lib/queryOptions/request';

export function useDraftMilkbags() {
  const { data: user } = useMeUser();
  const { data, ...query } = useQuery(createDraftMilkbagsQuery(user));

  const dataArray = useMemo(() => {
    if (!data) return data;
    return Array.from(data.values());
  }, [data]);

  return { ...query, data: dataArray, dataMap: data };
}

export function useRequest(data: string | Request | undefined, enabled?: boolean) {
  return useQuery(createRequestQuery(data, enabled));
}

export function useDonation(data: string | Donation | undefined, enabled?: boolean) {
  return useQuery(createDonationQuery(data, enabled));
}

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
