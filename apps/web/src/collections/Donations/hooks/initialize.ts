import { Donation, MilkBag } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeValidateHook } from 'payload';

export const initializeDonation: CollectionBeforeValidateHook<Donation> = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== 'create' || !data) return data;

  if (!data.details?.bags) {
    data.volume = 0;
    data.remainingVolume = 0;
    return data;
  }

  const { docs: bags } = await req.payload.find({
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
  }

  return data;
};
