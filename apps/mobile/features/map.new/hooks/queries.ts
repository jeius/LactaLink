import { QUERY_KEYS } from '@/lib/constants';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDeliveryPreference } from '../lib/fetch';
import {
  createDataMarkerQueryOptions,
  createNearestListingsInfQueryOptions,
} from '../lib/queryOptions';
import { DataMarkerSlug } from '../lib/types';

import { useCurrentCoordinates } from '@/lib/stores';
import { infiniteDataMapExtractor } from '@/lib/utils/infiniteDataMapExtractor';
import { Collection } from '@lactalink/types/collections';

import { useMemo } from 'react';

import { addToDataMarkerCache } from '../lib/utils/cacheUtils';

export function useMarkerDataQuery<T extends DataMarkerSlug>(
  data: { id: string; type: T } | null | undefined
) {
  return useQuery(createDataMarkerQueryOptions(data));
}

export function useDeliveryPreferenceQuery(id: string | null | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: [...QUERY_KEYS.DELIVERY_PREFERENCES.ONE, id].filter(Boolean),
    queryFn: ({ signal }) => fetchDeliveryPreference(id!, { signal }), // `enabled` ensures `id` is non-null
  });
}

export function useInfiniteNearestListings<
  TSlug extends Extract<DataMarkerSlug, 'donations' | 'requests'>,
>(type: TSlug) {
  const queryClient = useQueryClient();
  const currentCoords = useCurrentCoordinates();

  const { data, isPlaceholderData, ...query } = useInfiniteQuery(
    createNearestListingsInfQueryOptions({ type, coordinates: currentCoords })
  );

  const { dataArray, dataMap } = useMemo(
    () =>
      infiniteDataMapExtractor(data, (doc) => {
        if (!isPlaceholderData) {
          addToDataMarkerCache(queryClient, { value: doc as Collection<TSlug>, relationTo: type });
        }
      }),
    [data, isPlaceholderData, queryClient, type]
  );

  return { data: dataArray, dataMap, isPlaceholderData, ...query };
}
