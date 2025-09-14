import { INFINITE_QUERY_KEY } from '@/lib/constants';
import { useMatchingService } from '@lactalink/api';
import { DonationRequestStatus, Point } from '@lactalink/types';
import { Collection } from '@lactalink/types/collections';
import { CollectionSlug, PaginatedDocs } from '@lactalink/types/payload-types';
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';
import { useCurrentLocation } from '../location/useLocation';

export function useFetchNearest<TSlug extends Extract<CollectionSlug, 'donations' | 'requests'>>(
  collection: TSlug,
  enabled: boolean = true,
  status: DonationRequestStatus = 'AVAILABLE',
  maxDistance?: number
): UseInfiniteQueryResult<InfiniteData<PaginatedDocs<Collection<TSlug>> | null>> {
  const { location } = useCurrentLocation();
  const matchingService = useMatchingService();

  return useInfiniteQuery({
    enabled: enabled && Boolean(location),
    queryKey: [...INFINITE_QUERY_KEY, collection, 'nearest'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!location) {
        return null;
      }

      const point: Point = [location.coords.longitude, location.coords.latitude];

      switch (collection) {
        case 'donations':
          return matchingService.getNearestDonations(point, status, maxDistance, {
            page: pageParam,
            limit: 20,
          });
        case 'requests':
          return matchingService.getNearestRequests(point, status, maxDistance, {
            page: pageParam,
            limit: 20,
          });
        default:
          return null;
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.nextPage || null;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage?.prevPage || null;
    },
  });
}
