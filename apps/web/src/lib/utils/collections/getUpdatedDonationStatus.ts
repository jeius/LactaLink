import { Donation, MilkBag } from '@lactalink/types';

export function getUpdatedDonationStatus(
  bagDocs: Partial<MilkBag>[],
  status: Donation['status'] = 'AVAILABLE'
) {
  let someBagsExpired = false;
  let allBagsExpired = true;
  let someBagsAllocated = false;
  let totalVolume = 0;
  let remainingVolume = 0;

  for (const bag of bagDocs) {
    if (bag.status === 'EXPIRED') {
      someBagsExpired = true;
    } else {
      allBagsExpired = false;
    }

    if (bag.status !== 'DISCARDED') {
      totalVolume += bag.volume || 0;
    }

    if (bag.status === 'AVAILABLE') {
      remainingVolume += bag.volume || 0;
    }

    if (bag.status === 'ALLOCATED') {
      someBagsAllocated = true;
    }
  }

  let updatedStatus = status;

  // Determine the new status based on conditions
  if (allBagsExpired) {
    updatedStatus = 'EXPIRED';
  } else if (remainingVolume === 0) {
    updatedStatus = 'FULLY_ALLOCATED';
  } else if (remainingVolume < totalVolume && someBagsAllocated) {
    updatedStatus = 'PARTIALLY_ALLOCATED';
  } else if (remainingVolume !== 0 && someBagsExpired && !someBagsAllocated) {
    updatedStatus = 'AVAILABLE';
  }

  return { volume: totalVolume, remainingVolume, status: updatedStatus };
}
