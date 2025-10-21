import { getApiClient } from '@lactalink/api';
import {
  AddressCreateSchema,
  AddressSchema,
  DeliveryPreferenceCreateSchema,
  DeliveryPreferenceSchema,
} from '@lactalink/form-schemas';
import { Address, DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { toast } from 'sonner-native';

export async function upsertDeliveryPreference(
  data: DeliveryPreferenceSchema | DeliveryPreferenceCreateSchema
) {
  const apiClient = getApiClient();
  let message: string;
  let preference: DeliveryPreference;

  if ('id' in data) {
    const { id, ...rest } = data;
    preference = await apiClient.updateByID({
      collection: 'delivery-preferences',
      id: id,
      data: { ...rest, address: extractID(rest.address) },
    });

    message = `"${data.name || 'Delivery Preference'}" updated successfully.`;
  } else {
    preference = await apiClient.create({
      collection: 'delivery-preferences',
      data: { ...data, address: extractID(data.address) },
    });

    message = `"${data.name || 'Delivery Preference'}" created successfully.`;
  }

  return { message, data: preference };
}

export async function upsertAddress(data: AddressSchema | AddressCreateSchema) {
  const apiClient = getApiClient();
  async function executeAddressSave() {
    let message: string;
    let address: Address;

    const { coordinates: { latitude, longitude } = {}, ...rest } = data;
    const coordinates: [number, number] | undefined =
      latitude && longitude ? [longitude, latitude] : undefined;

    if ('id' in data) {
      address = await apiClient.updateByID({
        collection: 'addresses',
        id: data.id,
        data: {
          ...rest,
          coordinates,
        },
      });

      message = `"${data.name || 'Address'}" updated successfully.`;
    } else {
      address = await apiClient.create({
        collection: 'addresses',
        data: {
          ...rest,
          coordinates,
        },
      });

      message = `"${data.name || 'Address'}" created successfully.`;
    }

    return { message, data: address };
  }

  const promise = executeAddressSave();

  toast.promise(promise, {
    loading: 'Saving address...',
    success: (res: { message: string }) => {
      return res.message;
    },
    error: (error) => {
      return extractErrorMessage(error);
    },
  });

  const res = await promise.catch(() => null);

  return Boolean(res);
}
