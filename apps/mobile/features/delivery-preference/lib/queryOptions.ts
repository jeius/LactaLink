import { QUERY_KEYS } from '@/lib/constants';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { transformToInfiniteDataMap } from '@/lib/utils/transformToInfiniteData';
import { getApiClient } from '@lactalink/api';
import { DeliveryPreference, User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

export function createDeliveryPreferenceInfQuery(user: string | User | null | undefined) {
  const userID = extractID(user);
  const userDP = extractCollection(user)?.deliveryPreferences;
  const initialData = userDP && transformToInfiniteDataMap(userDP);
  return infiniteQueryOptions({
    enabled: !!user,
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.DELIVERY_PREFERENCES.INFINITE, userID],
    queryFn: async ({ pageParam = 1, signal }) => {
      if (!userID) {
        throw new Error('User must be logged in!');
      }

      const paginatedDocs = await getApiClient().find(
        {
          collection: 'delivery-preferences',
          page: pageParam,
          pagination: true,
          limit: 10,
          where: { owner: { equals: userID } },
        },
        { signal }
      );

      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => {
      if (prev) return prev;
      return initialData || generatePlaceHoldersForInfQueries<DeliveryPreference>(10);
    },
  });
}

export function createDeliveryPreferenceQuery(
  deliveryPreference: string | DeliveryPreference | null | undefined
) {
  const dpID = extractID(deliveryPreference);
  return queryOptions({
    enabled: !!deliveryPreference,
    queryKey: [...QUERY_KEYS.DELIVERY_PREFERENCES.ONE, dpID],
    queryFn: async ({ signal }) => {
      if (!dpID) throw new Error('Delivery Preference ID is required!');

      return getApiClient().findByID(
        {
          collection: 'delivery-preferences',
          id: dpID,
          joins: { donations: { count: true, limit: 0 }, requests: { count: true, limit: 0 } },
          depth: 2,
        },
        { signal }
      );
    },
    placeholderData: (prev) => {
      if (prev) return prev;
      return extractCollection(deliveryPreference) ?? undefined;
    },
  });
}
