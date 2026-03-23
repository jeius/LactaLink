import { getApiClient } from '@lactalink/api';
import { DeliveryPreferenceCreateSchema, DeliveryPreferenceSchema } from '@lactalink/form-schemas';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { mutationOptions } from '@tanstack/react-query';
import {
  addDeliveryPreferencesToAllCache,
  removeDeliveryPreferenceFromAllCache,
} from './cacheUtils';

export function createUpsertDPMutation() {
  return mutationOptions({
    mutationKey: ['delivery-preferences', 'upsert'],
    mutationFn: async (data: DeliveryPreferenceSchema | DeliveryPreferenceCreateSchema) => {
      const apiClient = getApiClient();
      let preference: DeliveryPreference;

      if ('id' in data) {
        const { id, ...rest } = data;
        preference = await apiClient.updateByID({
          collection: 'delivery-preferences',
          id: id,
          data: { ...rest, address: extractID(rest.address) },
        });
      } else {
        preference = await apiClient.create({
          collection: 'delivery-preferences',
          data: { ...data, address: extractID(data.address) },
        });
      }

      return preference;
    },
    onSuccess: async (data, _vars, _ctx, { client }) => {
      addDeliveryPreferencesToAllCache(client, data);
    },
  });
}

export function createDeleteDPMutation() {
  return mutationOptions({
    mutationKey: ['delivery-preferences', 'delete'],
    mutationFn: async (id: string) => {
      return getApiClient().deleteByID({ collection: 'delivery-preferences', id });
    },
    onSuccess: async (data, _vars, _ctx, { client }) => {
      removeDeliveryPreferenceFromAllCache(client, data);
    },
  });
}
