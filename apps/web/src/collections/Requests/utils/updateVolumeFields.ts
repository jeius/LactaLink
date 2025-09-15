import { Request } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

export async function updateVolumeFields(req: PayloadRequest, data: Partial<Request>) {
  // Ensure data is defined
  if (!data || !data.details?.bags) {
    return data;
  }

  // Calculate the total volume of selected milk bags
  const bagIDs = extractID(data.details?.bags || []);

  const { docs: bags } = await req.payload.find({
    req,
    collection: 'milkBags',
    where: { id: { in: bagIDs } },
    pagination: false,
    select: { volume: true },
  });

  const totalVolume = bags.reduce((sum, bag) => sum + (bag.volume || 0), 0);

  // Update the request's volumeFulfilled based on the selected bags
  data.volumeFulfilled = totalVolume;
  data.volumeNeeded = Math.max(20, (data.volumeNeeded || 0) - totalVolume);

  return data;
}
