import { Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeChangeHook, Payload } from 'payload';

export const initializeRequest: CollectionBeforeChangeHook<Request> = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== 'create') return data;

  const isForIndividual = !data.hospital && !data.milkBank;
  data.status = isForIndividual ? 'AVAILABLE' : 'PENDING';

  const updatedData = await calculateVolumeStatus(data, req.payload);

  return updatedData;
};

async function calculateVolumeStatus(data: Partial<Request>, payload: Payload) {
  if (!data.details?.bags || !data.volumeNeeded) {
    data.volumeStatus = 'UNFULFILLED';
    data.volumeFulfilled = 0;
    return data;
  }

  const { docs: bags } = await payload.find({
    collection: 'milkBags',
    where: { id: { in: extractID(data.details.bags) } },
    pagination: false,
    select: { volume: true },
  });

  // Use reduce for a single pass through the bags array
  const bagStats = bags.reduce(
    (acc, bag) => {
      const { volume } = bag;
      acc.totalVolume += volume;
      return acc;
    },
    {
      totalVolume: 0,
    }
  );

  const { totalVolume } = bagStats;

  // Update volume data
  data.volumeFulfilled = totalVolume;

  // Determine volume status using computed values
  if (totalVolume === 0) {
    data.volumeStatus = 'UNFULFILLED';
  } else if (totalVolume >= data.volumeNeeded) {
    data.volumeStatus = 'FULFILLED';
  } else if (totalVolume > 0 && totalVolume < data.volumeNeeded) {
    data.volumeStatus = 'PARTIALLY_FULFILLED';
  }

  return data;
}
