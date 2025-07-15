import { getApiClient } from '@lactalink/api';
import { Address, DeliveryPreference } from '@lactalink/types';
import { AddressSchema, DeliveryPreferenceSchema } from '@lactalink/types/forms';

export async function upsertDeliveryPreferences(deliveryDetails: DeliveryPreferenceSchema[]) {
  const apiClient = getApiClient();

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
  const apiClient = getApiClient();

  let message: string;
  let preference: DeliveryPreference;

  if (data.id) {
    preference = await apiClient.updateByID({
      collection: 'delivery-preferences',
      id: data.id,
      data: {
        name: data.name,
        address: data.address,
        availableDays: data.availableDays,
        preferredMode: data.preferredMode,
      },
    });

    message = `"${preference.name || 'Delivery Preference'}" updated successfully.`;
  } else {
    preference = await apiClient.create({
      collection: 'delivery-preferences',
      data: {
        name: data.name,
        address: data.address,
        availableDays: data.availableDays,
        preferredMode: data.preferredMode,
      },
    });

    message = `"${preference.name || 'Delivery Preference'}" created successfully.`;
  }

  return { message, data: preference };
}

export async function upsertAddress(data: AddressSchema) {
  const apiClient = getApiClient();

  let message: string;
  let address: Address;

  const { coordinates: { latitude, longitude } = {}, ...rest } = data;
  const coordinates: [number, number] | undefined =
    latitude && longitude ? [latitude, longitude] : undefined;

  if (data.id) {
    address = await apiClient.updateByID({
      collection: 'addresses',
      id: data.id,
      data: {
        ...rest,
        coordinates,
      },
    });

    message = `"${address.name || 'Address'}" updated successfully.`;
  } else {
    address = await apiClient.create({
      collection: 'addresses',
      data: {
        ...rest,
        coordinates,
      },
    });

    message = `"${address.name || 'Address'}" created successfully.`;
  }

  return { message, data: address };
}
