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

export function useRequest(data: string | Request | undefined) {
  return useQuery(createRequestQuery(data));
}

export function useDonation(data: string | Donation | undefined) {
  return useQuery(createDonationQuery(data));
}

export function useInfiniteIncomingDonations(user: User | null | undefined) {
  const queryClient = useQueryClient();
  const { data: docs, ...query } = useInfiniteQuery(createIncomingDonationsInfQuery(user));

  const { arrayDocs, mappedDocs } = useMemo(() => {
    if (!docs)
      return {
        arrayDocs: [],
        mappedDocs: new Map<string, Donation>(),
      };

    const arrayDocs: Donation[] = [];
    const mappedDocs: Map<string, Donation> = new Map();

    for (const page of docs.pages) {
      page.docs.forEach((doc) => {
        // Only add to cache and map if not placeholder data
        if (!query.isPlaceholderData) {
          // Also keep track in the map
          mappedDocs.set(doc.id, doc);
          // Add to cache as well
          addDonationToCache(queryClient, doc);
        }
        // Push each doc into the array
        arrayDocs.push(doc);
      });
    }

    return { arrayDocs, mappedDocs };
  }, [docs, query.isPlaceholderData, queryClient]);

  return { ...query, data: arrayDocs, dataMap: mappedDocs };
}

export function useInfiniteIncomingRequests(user: User | null | undefined) {
  const queryClient = useQueryClient();
  const { data: docs, ...query } = useInfiniteQuery(createIncomingRequestsInfQuery(user));

  const { arrayDocs, mappedDocs } = useMemo(() => {
    if (!docs)
      return {
        arrayDocs: [],
        mappedDocs: new Map<string, Request>(),
      };

    const arrayDocs: Request[] = [];
    const mappedDocs: Map<string, Request> = new Map();

    for (const page of docs.pages) {
      page.docs.forEach((doc) => {
        // Only add to cache and map if not placeholder data
        if (!query.isPlaceholderData) {
          // Also keep track in the map
          mappedDocs.set(doc.id, doc);
          // Add to cache as well
          addRequestToCache(queryClient, doc);
        }
        // Push each doc into the array
        arrayDocs.push(doc);
      });
    }

    return { arrayDocs, mappedDocs };
  }, [docs, query.isPlaceholderData, queryClient]);

  return { ...query, data: arrayDocs, dataMap: mappedDocs };
}
