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
    select: { donor: true },
  });

  return {
    and: [
      { 'donation.donor': { equals: extractID(donation.donor) } },
      { status: { equals: 'AVAILABLE' } },
    ],
  } as Where;
};
