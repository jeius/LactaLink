import {
  removeItemFromInfiniteDataMap,
  updateInfiniteDataMap,
} from '@/lib/utils/infiniteListUtils';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { QueryClient } from '@tanstack/react-query';
import { createDeliveryPreferenceInfQuery, createDeliveryPreferenceQuery } from './queryOptions';

export function addDeliveryPreferenceToCache(
  client: QueryClient,
  deliveryPreference: DeliveryPreference
) {
  const queryKey = createDeliveryPreferenceQuery(deliveryPreference).queryKey;
  client.setQueryData(queryKey, deliveryPreference);
}

export function addDeliveryPreferencesToInfiniteCache(
  client: QueryClient,
  deliveryPreference: DeliveryPreference
) {
  const queryKey = createDeliveryPreferenceInfQuery(deliveryPreference.owner).queryKey;

  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return updateInfiniteDataMap(oldData, deliveryPreference, 'none');
  });
}

export function addDeliveryPreferencesToAllCache(
  client: QueryClient,
  deliveryPreference: DeliveryPreference
) {
  addDeliveryPreferenceToCache(client, deliveryPreference);
  addDeliveryPreferencesToInfiniteCache(client, deliveryPreference);
}

export function removeDeliveryPreferenceFromCache(
  client: QueryClient,
  deliveryPreference: DeliveryPreference
) {
  const queryKey = createDeliveryPreferenceQuery(deliveryPreference).queryKey;
  client.removeQueries({ queryKey, exact: true });
}

export function removeDeliveryPreferenceFromInfiniteCache(
  client: QueryClient,
  deliveryPreference: DeliveryPreference
) {
  const queryKey = createDeliveryPreferenceInfQuery(deliveryPreference.owner).queryKey;
  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return removeItemFromInfiniteDataMap(oldData, deliveryPreference.id);
  });
}

export function removeDeliveryPreferenceFromAllCache(
  client: QueryClient,
  deliveryPreference: DeliveryPreference
) {
  removeDeliveryPreferenceFromCache(client, deliveryPreference);
  removeDeliveryPreferenceFromInfiniteCache(client, deliveryPreference);
}
