import { DeliveryPreference } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { FilterOptions } from 'payload';

export const addressFilterOptions: FilterOptions<DeliveryPreference> = async ({ data }) => {
  const owner = data?.owner;
  return owner ? { owner: { equals: extractID(owner) } } : true;
};
