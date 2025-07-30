import { Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeValidateHook } from 'payload';

export const initializeRequest: CollectionBeforeValidateHook<Request> = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== 'create' || !data) return data;

  data.status = data.recipient ? 'PENDING' : 'AVAILABLE';

  if (!data.details?.bags || !data.volumeNeeded) {
    data.volumeFulfilled = 0;
    return data;
  }

  const { docs: bags } = await req.payload.find({
    collection: 'milkBags',
    where: { id: { in: extractID(data.details.bags) } },
    pagination: false,
    select: { volume: true },
  });

  const totalVolume = bags.reduce((sum, bag) => sum + bag.volume, 0);

  // Update volume data
  data.volumeFulfilled = totalVolume;

  return data;
};
