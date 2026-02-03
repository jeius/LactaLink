import { Address, User } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addAddressToCache } from '../lib/cacheUtils';
import { createAddressesInfQuery, createAddressQuery } from '../lib/queryOptions';

export function useAddress(address: string | Address | null | undefined) {
  return useQuery(createAddressQuery(address));
}

export function useInfiniteAddresses(user: string | User | null | undefined) {
  const queryClient = useQueryClient();
  const { data, ...query } = useInfiniteQuery(createAddressesInfQuery(user));

  const { dataArray, dataMap } = useMemo(() => {
    const dataMap: Map<string, Address> = new Map();

    if (!data) return { dataArray: Array.from(dataMap.values()), dataMap };

    for (const page of data.pages) {
      for (const doc of page.docs.values()) {
        // Add to cache if it's not placeholder data
        if (!query.isPlaceholderData) addAddressToCache(queryClient, doc);
        // Add to map
        dataMap.set(doc.id, doc);
      }
    }

    return { dataArray: Array.from(dataMap.values()), dataMap };
  }, [data, query.isPlaceholderData, queryClient]);

  return { data: dataArray, dataMap, ...query };
}

export function usePrefetchAddress(user: string | User | null | undefined) {
  useInfiniteAddresses(user);
}
