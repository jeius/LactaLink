import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@/lib/services';
import { PaginatedDocsMap } from '@/lib/types';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Coordinates } from '@lactalink/types';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { CollectionSlug, PaginatedDocs } from '@lactalink/types/payload-types';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions } from '@tanstack/react-query';
import { getMyListings } from '../api/listings';

const STATUS = DONATION_REQUEST_STATUS.AVAILABLE.value;
const LIMIT = 15;

const createDefaultPaginatedDocs = <T>(page: number): PaginatedDocsMap<T> => ({
  docs: new Map<string, T>(),
  totalDocs: 0,
  totalPages: 0,
  page,
  limit: LIMIT,
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
    queryKey: [...QUERY_KEYS.LISTINGS.NEAREST, 'donations', coordinates, maxDistance],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const paginatedDocs = await getApiClient().find(
        {
          collection: 'donations',
          where: { status: { equals: STATUS } },
          page: pageParam,
          limit: LIMIT,
          depth: 3,
        },
        { signal }
      );

      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => {
      if (prev) return prev;
      return generatePlaceHoldersForInfQueries(15);
    },
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
    queryKey: [...QUERY_KEYS.LISTINGS.NEAREST, 'requests', coordinates, maxDistance],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const paginatedDocs = await getApiClient().find(
        {
          collection: 'requests',
          where: { status: { equals: STATUS } },
          page: pageParam,
          limit: LIMIT,
          depth: 3,
        },
        { signal }
      );

      return transformToPaginatedMappedDocs(paginatedDocs as PaginatedDocs<Request>);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => {
      if (prev) return prev;
      return generatePlaceHoldersForInfQueries(15);
    },
    gcTime: 1000 * 60 * 1, // 1 minutes
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
  });
}

export function createMyListingsInfQuery(
  collection: Extract<CollectionSlug, 'donations' | 'requests'> | undefined | null
) {
  return infiniteQueryOptions({
    enabled: !!collection,
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.LISTINGS.INFINITE, collection],
    queryFn: async ({ pageParam, signal }) => {
      if (!collection) return createDefaultPaginatedDocs<Donation | Request>(pageParam);
      const paginatedDocs = await getMyListings(
        { collection, page: pageParam, limit: LIMIT },
        { signal }
      );
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (page) => page.nextPage,
    getPreviousPageParam: (page) => page.prevPage,
    placeholderData: (prev) => {
      if (prev) return prev;
      return generatePlaceHoldersForInfQueries(15);
    },
  });
}
