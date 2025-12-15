import { getApiClient } from '@lactalink/api';
import { MilkBagCreateSchema } from '@lactalink/form-schemas';

export async function updateMilkBag({ id, ...data }: MilkBagCreateSchema) {
  const apiClient = getApiClient();

  return apiClient.updateByID({
    collection: 'milkBags',
    id: id,
    data: data,
  });
}
