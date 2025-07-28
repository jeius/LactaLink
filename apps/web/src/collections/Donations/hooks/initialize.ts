import { Donation, MilkBag } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeChangeHook, Payload } from 'payload';

export const initializeDonation: CollectionBeforeChangeHook<Donation> = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== 'create') return data;

  const isForIndividual = !data.hospital && !data.milkBank;
  data.status = isForIndividual ? 'AVAILABLE' : 'PENDING';

  const updatedData = await calculateStatusAndVolumeStatus(data, req.payload);

  return updatedData;
};

async function calculateStatusAndVolumeStatus(data: Partial<Donation>, payload: Payload) {
  if (!data.details?.bags) {
    data.volumeStatus = 'UNALLOCATED';
    data.volume = 0;
    data.remainingVolume = 0;
    return data;
  }

  const { docs: bags } = await payload.find({
    collection: 'milkBags',
    where: { id: { in: extractID(data.details.bags) } },
    pagination: false,
    select: { status: true, volume: true },
  });

  // Use reduce for a single pass through the bags array
  const bagStats = bags.reduce(
    (acc, bag) => {
      const { status, volume = 0 } = bag;

      // Track status counts
      acc.statusCounts[status] = (acc.statusCounts[status] || 0) + 1;

      // Calculate volumes based on status
      if (status !== 'DISCARDED') {
        acc.totalVolume += volume;
      }

      if (status === 'AVAILABLE') {
        acc.remainingVolume += volume;
      }

      return acc;
    },
    {
      statusCounts: {} as Record<MilkBag['status'], number>,
      totalVolume: 0,
      remainingVolume: 0,
    }
  );

  const { statusCounts, totalVolume, remainingVolume } = bagStats;
  const totalBags = bags.length;

  // Update volume data
  data.volume = totalVolume;
  data.remainingVolume = remainingVolume;

  // Determine status using computed values
  if (statusCounts.EXPIRED === totalBags) {
    // All bags expired
    data.status = 'EXPIRED';
  } else if (remainingVolume === 0) {
    // No remaining volume
    data.volumeStatus = 'FULLY_ALLOCATED';
  } else if (remainingVolume < totalVolume && statusCounts.ALLOCATED > 0) {
    // Some bags allocated and remaining volume less than total
    data.volumeStatus = 'PARTIALLY_ALLOCATED';
  }

  return data;
}
