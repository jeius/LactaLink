import { MILK_BAG_STATUS } from '@lactalink/enums';
import { Request } from '@lactalink/types/payload-generated-types';
import { PayloadRequest } from 'payload';

const expiredStatus = MILK_BAG_STATUS.EXPIRED.value;
const discardedStatus = MILK_BAG_STATUS.DISCARDED.value;

export async function calculateVolumes<T extends Request>(
  doc: T | Partial<T>,
  req: PayloadRequest
) {
  let volumeNeeded = doc.initialVolumeNeeded || 20;
  doc.fulfillmentPercentage = 0;

  const bagIDs = doc.details?.bags || [];

  if (bagIDs.length === 0) {
    doc.volumeNeeded = volumeNeeded;
    doc.volumeFulfilled = 0;
    doc.fulfillmentPercentage = 0;
    return doc;
  }

  const { docs: bags } = await req.payload.find({
    collection: 'milkBags',
    req,
    where: { id: { in: bagIDs } },
    select: { volume: true, status: true },
    pagination: false,
  });

  const volumeFulfilled = bags.reduce((sum, bag) => {
    if (bag.status === expiredStatus || bag.status === discardedStatus) {
      return sum;
    }
    return sum + bag.volume;
  }, 0);

  volumeNeeded = Math.max(0, volumeNeeded - volumeFulfilled);

  if (volumeNeeded >= 0) {
    // Calculate fulfillment percentage
    const percentage = Math.min(100, Math.round((volumeFulfilled / volumeNeeded) * 100)); // 0 to 100

    doc.fulfillmentPercentage = percentage;
  }

  doc.volumeNeeded = volumeNeeded;
  doc.volumeFulfilled = volumeFulfilled;

  return doc;
}
