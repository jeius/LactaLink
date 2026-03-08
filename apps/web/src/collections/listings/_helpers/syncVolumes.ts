import { Donation, MilkBag, Request } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

/**
 * For `Donations`, calculates total and remaining volumes based on associated milk bags,
 * and updates the donation status to EXPIRED if all bags are expired.
 * For `Requests`, calculates the total fulfilled volume and updates the needed volume accordingly.
 *
 * @param doc - The `Donation` or `Request` document being validated, which may contain bag references.
 * @param req - The Payload request context (used to fetch milk bag data).
 * @returns A message summarizing the volume synchronization results.
 * @throws An error if fetching milk bag data fails.
 */
export async function syncVolumes(doc: Partial<Donation | Request>, req: PayloadRequest) {
  const milkBagIDs = extractID(doc.details?.bags || []);

  if (milkBagIDs.length === 0) {
    return 'No milk bags associated, skipping volume sync.';
  }

  const { statusCounts, totalVolume, remainingVolume } = await calculateVolumes(milkBagIDs, req);

  if ('donor' in doc) {
    doc.volume = totalVolume;
    doc.remainingVolume = remainingVolume;

    // Set status to EXPIRED if all bags are expired
    if (statusCounts.EXPIRED === milkBagIDs.length) {
      doc.status = 'EXPIRED';
    }

    return `Volumes synced. Total Volume: ${doc.volume} mL, Remaining Volume: ${doc.remainingVolume} mL.`;
  }

  if ('requester' in doc) {
    doc.volumeFulfilled = totalVolume;

    // Calculate the needed volume based on the fulfilled volume,
    // ensuring it doesn't go below the minimum of 20 mL
    const currentNeeded = doc.volumeNeeded || doc.initialVolumeNeeded || 20;
    doc.volumeNeeded = Math.max(0, currentNeeded - totalVolume);

    return `Volumes synced. Volume Fulfilled: ${doc.volumeFulfilled} mL, Volume Needed: ${doc.volumeNeeded} mL.`;
  }

  return `Data is neither a Donation nor a Request. Total Volume Calculated: ${totalVolume} mL.`;
}

/**
 * Helper function to calculate total and remaining volumes based on milk bag IDs.
 *
 * @param bagIDs - An array of milk bag IDs to calculate volumes for.
 * @param req - The Payload request context, used to fetch milk bag data.
 * @returns An object containing `statusCounts`, `totalVolume`, and `remainingVolume`.
 * @throws An error if fetching milk bag data fails.
 */
async function calculateVolumes(bagIDs: string[], req: PayloadRequest) {
  const { docs: bags } = await req.payload.find({
    collection: 'milkBags',
    where: { id: { in: bagIDs } },
    select: { status: true, volume: true, expiresAt: true },
    limit: 0,
    depth: 0,
    req,
  });

  // Use reduce for a single pass through the bags array
  return bags.reduce(
    (acc, bag) => {
      const { status, volume = 0 } = bag;

      // Track status counts
      acc.statusCounts[status] += 1;

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
}
