import { getApiClient } from '@lactalink/api';
import { AddressSchema, DeliveryPreferenceSchema } from '@lactalink/form-schemas';
import { Address, DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { toast } from 'sonner-native';

const apiClient = getApiClient();

export async function upsertDeliveryPreferences(deliveryDetails: DeliveryPreferenceSchema[]) {
  return await Promise.all(
    deliveryDetails.map((detail) => {
      const { id, ...rest } = detail;
      if (id) {
        return apiClient.updateByID({
          id,
          collection: 'delivery-preferences',
          data: rest,
          depth: 0,
        });
      }

      return apiClient.create({ collection: 'delivery-preferences', data: rest, depth: 0 });
    })
  );
}

export async function upsertDeliveryPreference(data: DeliveryPreferenceSchema) {
  let message: string;
  let preference: DeliveryPreference;

  const { id, ...rest } = data;

  if (id) {
    preference = await apiClient.updateByID({
      collection: 'delivery-preferences',
      id,
      data: rest,
    });

    message = `"${data.name || 'Delivery Preference'}" updated successfully.`;
  } else {
    preference = await apiClient.create({
      collection: 'delivery-preferences',
      data: rest,
    });

    message = `"${data.name || 'Delivery Preference'}" created successfully.`;
  }

  return { message, data: preference };
}

export async function upsertAddress(data: AddressSchema) {
  async function executeAddressSave() {
    let message: string;
    let address: Address;

    const { coordinates: { latitude, longitude } = {}, ...rest } = data;
    const coordinates: [number, number] | undefined =
      latitude && longitude ? [longitude, latitude] : undefined;

    if (data.id) {
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
