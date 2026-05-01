import { QUERY_KEYS } from '@/lib/constants';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { Coordinates } from '@lactalink/types';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { fetchMarkerData, fetchNearestListings } from './fetch';
import { DataMarkerSlug } from './types';

export function createDataMarkerQueryOptions<T extends DataMarkerSlug>(
  data: { id: string; type: T } | null | undefined
) {
  return queryOptions({
    enabled: !!data,
    queryKey: ['marker', 'details', data?.type, data?.id].filter(Boolean),
    queryFn: ({ signal }) => fetchMarkerData(data!, { signal }), // `enabled` ensures `data` is non-null
  });
}

export function createNearestListingsInfQueryOptions<
  TSlug extends Extract<DataMarkerSlug, 'donations' | 'requests'>,
>(
  params?: {
    type: TSlug;
    coordinates: Coordinates | null | undefined;
  } | null
) {
  return infiniteQueryOptions({
    enabled: !!params,
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.LISTINGS.INFINITE, params?.type].filter(Boolean),
    queryFn: async ({ pageParam, signal }) => {
      if (!params) throw new Error('Parameters are required to fetch nearest listings');

      const paginatedDocs = await fetchNearestListings(
        {
          type: params.type,
          coordinates: params.coordinates,
          page: pageParam,
        },
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
