import { MILK_BAG_STATUS } from '@lactalink/enums';
import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { PayloadRequest } from 'payload';

export async function calculateVolumes<T extends Donation>(
  doc: T | Partial<T>,
  req: PayloadRequest
) {
  const volume = 0;
  const remainingVolume = 0;

  const bagIDs = extractID(doc.details?.bags || []);

  if (bagIDs.length === 0) {
    doc.volume = volume;
    doc.remainingVolume = remainingVolume;
    return doc;
  }

  const { docs: bags } = await req.payload.find({
    collection: 'milkBags',
    req,
    where: { id: { in: bagIDs } },
    select: { volume: true, status: true },
    pagination: false,
  });

  const result = bags.reduce(
    (acc, bag) => {
      acc.volume += bag.volume;
      if (bag.status === MILK_BAG_STATUS.AVAILABLE.value) {
        acc.remainingVolume += bag.volume;
      }
      return acc;
    },
    { volume, remainingVolume }
  );

  doc.volume = result.volume;
  doc.remainingVolume = result.remainingVolume;

  return doc;
}
