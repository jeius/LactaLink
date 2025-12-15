import { getApiClient } from '@lactalink/api';
import { MilkBag } from '@lactalink/types/payload-generated-types';

export async function deleteMilkBag(id: string): Promise<MilkBag> {
  const apiClient = getApiClient();
  return apiClient.deleteByID({ collection: 'milkBags', id });
}
