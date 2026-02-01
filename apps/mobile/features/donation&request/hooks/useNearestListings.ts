import { useCurrentCoordinates } from '@/lib/stores';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addDonationToCache, addRequestToCache } from '../lib/cacheUtils';
import {
  createNearestDonationsInfQuery,
  createNearestRequestsInfQuery,
} from '../lib/queryOptions/listings';

export function useNearestDonations(maxDistance?: number) {
  const queryClient = useQueryClient();
  const coordinates = useCurrentCoordinates();
  const { data, ...query } = useInfiniteQuery(
    createNearestDonationsInfQuery(coordinates, maxDistance)
  );

  const dataArray = useMemo(() => {
    if (!data) return [];

    const arrayDocs: Donation[] = [];

    for (const page of data.pages) {
      page.docs.forEach((doc) => {
        if (!query.isPlaceholderData) {
          // Add to cache
          addDonationToCache(queryClient, doc);
        }
        // Push each doc into the array
        arrayDocs.push(doc);
      });
    }

    return arrayDocs;
  }, [data, query.isPlaceholderData, queryClient]);

  return { ...query, data: dataArray };
}

export function useNearestRequests(maxDistance?: number) {
  const queryClient = useQueryClient();
  const coordinates = useCurrentCoordinates();
  const { data, ...query } = useInfiniteQuery(
    createNearestRequestsInfQuery(coordinates, maxDistance)
  );

  const dataArray = useMemo(() => {
    if (!data) return [];

    const arrayDocs: Request[] = [];

    for (const page of data.pages) {
      page.docs.forEach((doc) => {
        if (!query.isPlaceholderData) {
          // Add to cache
          addRequestToCache(queryClient, doc);
        }
        // Push each doc into the array
        arrayDocs.push(doc);
      });
    }

    return arrayDocs;
  }, [data, query.isPlaceholderData, queryClient]);

  return { ...query, data: dataArray };
}
