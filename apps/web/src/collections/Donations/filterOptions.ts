import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { FilterOptions, Where } from 'payload';

export const filterMilkBagsOptions: FilterOptions<Donation> = async ({ data }) => {
  if (!data?.donor) {
    return false;
  }

  return {
    and: [{ donor: { equals: extractID(data.donor) } }, { status: { equals: 'AVAILABLE' } }],
  } as Where;
};
