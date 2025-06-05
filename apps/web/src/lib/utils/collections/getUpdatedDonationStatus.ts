import { Donation, MilkBag } from '@lactalink/types';

export function getUpdatedDonationStatus(
  bagDocs: Partial<MilkBag>[],
  status: Donation['status'] = 'AVAILABLE'
) {
  const allBagsExpired = bagDocs.every((bag) => bag.status === 'EXPIRED');
  const totalVolume = bagDocs
    .filter((bag) => bag.status !== 'DISCARDED')
    .reduce((sum, bag) => sum + (bag.volume || 0), 0);
  const remainingVolume = bagDocs
    .filter((bag) => bag.status === 'AVAILABLE')
    .reduce((sum, bag) => sum + (bag.volume || 0), 0);

  let updatedStatus = status;

  // Determine the new status based on conditions
  if (allBagsExpired) {
    updatedStatus = 'EXPIRED';
  } else if (remainingVolume === 0) {
    updatedStatus = 'FULLY_ALLOCATED';
  } else if (remainingVolume < totalVolume) {
    updatedStatus = 'PARTIALLY_ALLOCATED';
  } else if (remainingVolume === totalVolume) {
    updatedStatus = 'AVAILABLE';
  }

  return { volume: totalVolume, remainingVolume, status: updatedStatus };
}
