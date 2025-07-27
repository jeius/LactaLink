import { Donation, Request } from '@lactalink/types';
import { extractCollection, extractID, isString } from '@lactalink/utilities';
import { FilterOptions, Where } from 'payload';

export const filterDeliveryPreferences: FilterOptions<Donation | Request> = async ({
  data,
  req,
}) => {
  const individual = 'donor' in data ? data.donor : data.requester;

  if (!individual) {
    return false; // No individual to filter by
  }

  let ownerID: string | null = null;

  if (isString(individual)) {
    const { owner } = await req.payload.findByID({
      collection: 'individuals',
      id: extractID(individual),
      depth: 0,
    });

    if (owner) {
      ownerID = extractID(owner);
    }
  } else {
    const individualObj = extractCollection(individual);
    if (individualObj && individualObj.owner) {
      ownerID = extractID(individualObj.owner);
    }
  }

  if (!ownerID) {
    return false;
  }

  return {
    owner: { equals: ownerID },
  } as Where;
};
