import { Donation } from '@lactalink/types';
import { extractCollection, extractID, isString } from '@lactalink/utilities';
import { FilterOptions, Where } from 'payload';

export const filterMilkBagsOptions: FilterOptions<Donation> = async ({ data }) => {
  if (!data?.donor) {
    return false;
  }

  return {
    and: [{ donor: { equals: extractID(data.donor) } }, { status: { equals: 'AVAILABLE' } }],
  } as Where;
};

export const filterDeliveryPreferences: FilterOptions<Donation> = async ({ data, req }) => {
  if (!data?.donor) {
    return false;
  }

  let ownerID: string | null = null;

  if (isString(data.donor)) {
    const { owner } = await req.payload.findByID({
      collection: 'individuals',
      id: extractID(data.donor),
      depth: 0,
    });

    if (owner) {
      ownerID = extractID(owner);
    }
  } else {
    const donor = extractCollection(data.donor);
    if (donor && donor.owner) {
      ownerID = extractID(donor.owner);
    }
  }

  if (!ownerID) {
    return false;
  }

  return {
    owner: { equals: ownerID },
  } as Where;
};
