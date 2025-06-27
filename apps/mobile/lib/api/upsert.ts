import { getApiClient } from '@lactalink/api';
import { DeliverySchema } from '@lactalink/types';

export async function upsertDeliveryPreferences(deliveryDetails: DeliverySchema[]) {
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
