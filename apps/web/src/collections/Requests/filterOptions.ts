import { Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { FilterOptions, Where } from 'payload';

export const filterMilkBagsOptions: FilterOptions<Request> = async ({ data, req }) => {
  if (!data?.matchedDonation) {
    return false;
  }

  const donation = await req.payload.findByID({
    collection: 'donations',
    id: extractID(data.matchedDonation),
    depth: 0,
    select: { details: { bags: true }, donor: true },
  });

  const bagIds = donation.details.bags.map((bag) => extractID(bag));

  if (bagIds.length === 0) {
    return false; // No bags to filter
  }

  return {
    and: [{ donor: { equals: extractID(donation.donor) } }, { status: { equals: 'AVAILABLE' } }],
  } as Where;
};

export const filterMatchedDonationOptions: FilterOptions<Request> = async ({ data }) => {
  const volumeNeeded = data?.volumeNeeded;
  const where: Where[] = [{ remainingVolume: { greater_than: 0 } }];

  if (volumeNeeded) {
    where.push({ remainingVolume: { greater_than_equal: volumeNeeded } });
  }

  return {
    and: where,
  };
};
