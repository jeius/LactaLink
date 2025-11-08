import { INFINITE_QUERY_KEY } from '@/lib/constants';
import { useCurrentCoordinates } from '@/lib/stores/locationStore';
import { useMatchingService } from '@lactalink/api';
import { DonationRequestStatus, Point } from '@lactalink/types';
import { Collection } from '@lactalink/types/collections';
import { CollectionSlug, PaginatedDocs } from '@lactalink/types/payload-types';
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';

export function useFetchNearest<TSlug extends Extract<CollectionSlug, 'donations' | 'requests'>>(
  collection: TSlug,
  enabled: boolean = true,
  status: DonationRequestStatus = 'AVAILABLE',
  maxDistance?: number
): UseInfiniteQueryResult<InfiniteData<PaginatedDocs<Collection<TSlug>> | null>> {
  const coords = useCurrentCoordinates();
  const matchingService = useMatchingService();

  return useInfiniteQuery({
    enabled: enabled && Boolean(coords),
    queryKey: [...INFINITE_QUERY_KEY, collection, 'nearest'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!coords) {
        return null;
      }

      const point: Point = [coords.longitude, coords.latitude];

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
