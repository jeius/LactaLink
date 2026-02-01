import { QUERY_KEYS } from '@/lib/constants';
import { getMatchingService } from '@/lib/services';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Coordinates } from '@lactalink/types';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { PaginatedDocs } from '@lactalink/types/payload-types';
import { latLngToPoint } from '@lactalink/utilities/geo-utils';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions } from '@tanstack/react-query';

const status = DONATION_REQUEST_STATUS.AVAILABLE.value;
const limit = 15;

const createDefaultPaginatedDocs = <T>(page: number): PaginatedDocs<T> => ({
  docs: [],
  totalDocs: 0,
  totalPages: 0,
  page,
  limit: limit,
  hasNextPage: false,
  hasPrevPage: false,
  nextPage: null,
  prevPage: null,
  pagingCounter: 0,
});

export function createNearestDonationsInfQuery(
  coordinates: Coordinates | null | undefined,
  maxDistance: number | undefined
) {
  return infiniteQueryOptions({
    enabled: !!coordinates,
    queryKey: [...QUERY_KEYS.LISTINGS.NEAREST, 'donations', maxDistance],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!coordinates) return createDefaultPaginatedDocs<Donation>(pageParam);

      const point = latLngToPoint(coordinates);
      const matchingService = getMatchingService();
      const paginatedDocs = await matchingService.getNearestDonations(point, status, maxDistance, {
        page: pageParam,
        limit: limit,
      });

      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) =>
      prev !== undefined ? prev : generatePlaceHoldersForInfQueries<Donation>(limit),
    gcTime: 1000 * 60 * 1, // 1 minutes
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
  });
}

export function createNearestRequestsInfQuery(
  coordinates: Coordinates | null | undefined,
  maxDistance: number | undefined
) {
  return infiniteQueryOptions({
    enabled: !!coordinates,
    queryKey: [...QUERY_KEYS.LISTINGS.NEAREST, 'requests', maxDistance],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!coordinates) return createDefaultPaginatedDocs<Request>(pageParam);

      const point = latLngToPoint(coordinates);
      const matchingService = getMatchingService();
      const paginatedDocs = await matchingService.getNearestRequests(point, status, maxDistance, {
        page: pageParam,
        limit: limit,
      });

      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) =>
      prev !== undefined ? prev : generatePlaceHoldersForInfQueries<Request>(limit),
    gcTime: 1000 * 60 * 1, // 1 minutes
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
  });
}
