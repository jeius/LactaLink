import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@/lib/services';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { useQuery } from '@tanstack/react-query';
import { createDeliveryPreferenceQuery } from '../../lib/queryOptions';

export * from './useInfiniteDeliveryPreferences';

export function useDeliveryPreference(
  deliveryPreference: string | DeliveryPreference | null | undefined
) {
  return useQuery(createDeliveryPreferenceQuery(deliveryPreference));
}

export function useDeliveryPreferencesQuery(
  deliveryPreferences: (string | DeliveryPreference)[] | null | undefined
) {
  const dpIDs = deliveryPreferences?.map((dp) => extractID(dp));

  return useQuery({
    enabled: !!dpIDs,
    queryKey: [...QUERY_KEYS.DELIVERY_PREFERENCES.ALL, dpIDs].filter(Boolean),
    queryFn: async ({ signal }) => {
      if (!dpIDs) return [];
      return getApiClient().find(
        {
          collection: 'delivery-preferences',
          where: { id: { in: dpIDs } },
          depth: 2,
          pagination: false,
        },
        { signal }
      );
    },
    placeholderData: (prev) => {
      if (prev) return prev;
      return extractCollection(deliveryPreferences) ?? undefined;
    },
  });
}
