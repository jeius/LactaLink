import { DONATION_REQUEST_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
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

  // Check if all bags are expired
  const _allExpired =
    bags.length > 0 && bags.every((bag) => bag.status === MILK_BAG_STATUS.EXPIRED.value);

  // if (allExpired) {
  //   // At this point, all bags are expired, update donation status if needed
  //   return await updateStatusOnBagsExpired(doc, req);
  // }

  return doc;
}

async function _updateStatusOnBagsExpired<T extends Donation>(
  doc: T | Partial<T>,
  req: PayloadRequest
) {
  if (req.context.donationStatus === DONATION_REQUEST_STATUS.EXPIRED.value) {
    // If the status has already been set to 'EXPIRED' in this request context, skip further checks
    return doc;
  }

  switch (doc.status) {
    case DONATION_REQUEST_STATUS.CANCELLED.value:
    case DONATION_REQUEST_STATUS.COMPLETED.value:
    case DONATION_REQUEST_STATUS.EXPIRED.value:
    case DONATION_REQUEST_STATUS.MATCHED.value:
    case DONATION_REQUEST_STATUS.REJECTED.value:
      // If already cancelled, completed, matched, rejected, or expired, do nothing
      return doc;
    case DONATION_REQUEST_STATUS.PENDING.value:
    case DONATION_REQUEST_STATUS.AVAILABLE.value:
    default:
      // For all other statuses, we will proceed to check the bags' statuses
      break;
  }

  // Set a flag in the request context to avoid redundant updates
  req.context.donationStatus = DONATION_REQUEST_STATUS.EXPIRED.value;

  // Update the donation status to 'EXPIRED'
  if (doc.id) {
    const updated = await req.payload.update({
      collection: 'donations',
      id: doc.id,
      req,
      depth: 0,
      data: {
        status: DONATION_REQUEST_STATUS.EXPIRED.value,
        expiredAt: new Date().toISOString(),
      },
    });

    // Reflect the change in the current read operation
    doc.status = updated.status;
    doc.expiredAt = updated.expiredAt;
  }

  return doc;
}
