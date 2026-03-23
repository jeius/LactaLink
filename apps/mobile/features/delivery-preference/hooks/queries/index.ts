import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { useQuery } from '@tanstack/react-query';
import { createDeliveryPreferenceQuery } from '../../lib/queryOptions';

export * from './useInfiniteDeliveryPreferences';

export function useDeliveryPreference(
  deliveryPreference: string | DeliveryPreference | null | undefined
) {
  return useQuery(createDeliveryPreferenceQuery(deliveryPreference));
}
