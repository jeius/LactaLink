import { useCurrentCoordinates } from '@/lib/stores';
import { infiniteDataMapExtractor } from '@/lib/utils/infiniteDataMapExtractor';
import { Collection } from '@lactalink/types/collections';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { QueryClient, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createNearestOrgInfQueryOptions } from '../lib/queryOptions';

export function useInfiniteNearestOrganizations<
  TSlug extends Extract<CollectionSlug, 'hospitals' | 'milkBanks'>,
>(
  type: TSlug,
  options: {
    search?: string | null;
    callback?: (doc: Collection<TSlug>, client: QueryClient) => void;
  } = {}
) {
  const queryClient = useQueryClient();
  const currentCoords = useCurrentCoordinates();

  const { search, callback } = options;
  const { data, isPlaceholderData, ...query } = useInfiniteQuery(
    createNearestOrgInfQueryOptions({ type, coordinates: currentCoords, search })
  );

  const { dataArray, dataMap } = useMemo(
    () =>
      infiniteDataMapExtractor(data, (doc) => {
        if (!isPlaceholderData) callback?.(doc, queryClient);
      }),
    [callback, data, isPlaceholderData, queryClient]
  );

  return { data: dataArray, dataMap, isPlaceholderData, ...query };
}
