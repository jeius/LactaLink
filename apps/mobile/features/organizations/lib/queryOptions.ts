import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { getMatchingService } from '@/lib/services';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { Coordinates } from '@lactalink/types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { latLngToPoint } from '@lactalink/utilities/geo-utils';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions } from '@tanstack/react-query';

export function createNearestOrgInfQueryOptions<
  TSlug extends Extract<CollectionSlug, 'hospitals' | 'milkBanks'>,
>(
  params?: {
    type: TSlug;
    coordinates: Coordinates | null | undefined;
    search?: string | null;
  } | null
) {
  return infiniteQueryOptions({
    enabled: !!params,
    initialPageParam: 1,
    queryKey: ['organizations', 'infinite', params?.type, params?.search].filter(Boolean),
    queryFn: async ({ pageParam, signal }) => {
      if (!params) throw new Error('Parameters are required to fetch nearest organizations');
      const { type, coordinates, search } = params;
      const point = latLngToPoint(coordinates ?? PHILIPPINES_COORDINATES);
      const paginatedDocs = await getMatchingService().getNearestOrganizations(
        { collection: type, location: point, search, page: pageParam, limit: 15, depth: 2 },
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
