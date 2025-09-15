import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { FilterOptions } from 'payload';

export const addressFilterOptions: FilterOptions<DeliveryPreference> = async ({ data }) => {
  const owner = data?.owner;
  return owner ? { owner: { equals: extractID(owner) } } : true;
};
