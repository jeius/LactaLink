import { Donation, Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { FilterOptions } from 'payload';

export const filterOptions: FilterOptions<Donation | Request> = async ({ data, req }) => {
  let individualId: string | undefined = undefined;

  if (data && 'donor' in data && data.donor) {
    individualId = extractID(data.donor);
  }

  if (data && 'requester' in data && data.requester) {
    individualId = extractID(data.requester);
  }

  if (!individualId) {
    return true; // No individual ID, no filtering needed
  }

  const { owner } = await req.payload.findByID({
    id: individualId,
    collection: 'individuals',
    depth: 0,
    select: { owner: true },
  });

  return owner ? { owner: { equals: extractID(owner) } } : true;
};
