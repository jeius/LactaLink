import { infiniteDataMapExtractor } from '@/lib/utils/infiniteDataMapExtractor';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createMyListingsInfQuery } from '../../lib/queryOptions/listings';

export function useInfiniteMyListings(
  collection: Extract<CollectionSlug, 'donations' | 'requests'> | undefined | null
) {
  const { data, ...query } = useInfiniteQuery(createMyListingsInfQuery(collection));
  const { dataArray, dataMap } = useMemo(() => infiniteDataMapExtractor(data), [data]);
  return { data: dataArray, dataMap, ...query };
}
