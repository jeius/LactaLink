/**
 * @fileoverview This file contains helper functions for the Donations collection,
 * such as hooks and utilities for managing related documents when a donation is deleted.
 */

import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Donation, MilkBag } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

const PENDING_STAT = DONATION_REQUEST_STATUS.PENDING.value;
const AVAILABLE_STAT = DONATION_REQUEST_STATUS.AVAILABLE.value;

/**
 * Calculates total and remaining volumes based on associated milk bags.
 * Also counts the status of each bag to determine if all are expired.
 *
 * @param data - The partial `Donation` data being validated, which may contain bag references.
 * @param req - The Payload request context (used to fetch milk bag data).
 * @returns A message summarizing the volume synchronization results.
 * @throws An error if fetching milk bag data fails.
 */
export async function ensureVolumesSynced(data: Partial<Donation>, req: PayloadRequest) {
  const milkBagIDs = extractID(data.details?.bags || []);

  if (milkBagIDs.length > 0) {
    const { statusCounts, totalVolume, remainingVolume } = await calculateVolumes(milkBagIDs, req);

    // Update volume data
    data.volume = totalVolume;
    data.remainingVolume = remainingVolume;

    // Determine status using computed values
    if (statusCounts.EXPIRED === milkBagIDs.length) {
      // All bags expired
      data.status = 'EXPIRED';
    }
  }

  return `Volumes synced successfully. Total Volume: ${data.volume} mL, Remaining Volume: ${data.remainingVolume} mL.`;
}

/**
 * Helper function to calculate total and remaining volumes based on milk bag IDs.
 *
 * @param bagIDs - An array of milk bag IDs to calculate volumes for.
 * @param req - The Payload request context, used to fetch milk bag data.
 * @returns An object containing `statusCounts`, `totalVolume`, and `remainingVolume`.
 * @throws An error if fetching milk bag data fails.
 */
export async function calculateVolumes(bagIDs: string[], req: PayloadRequest) {
  const { docs: bags } = await req.payload.find({
    collection: 'milkBags',
    where: { id: { in: bagIDs } },
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

/**
 * Updates the donation status based on the presence of a recipient.
 *
 * @remarks
 * - If a recipient is specified, the status is set to 'PENDING'. Meaning
 *   the donation is waiting for the recipient to accept it.
 * - If no recipient is specified, the status is set to 'AVAILABLE'. Meaning
 *   the donation is available for recipients to claim.
 *
 * @param data - The partial `Donation` data being validated, which may contain a recipient reference.
 * @returns The `data` param with the status field set according to recipient presence.
 */
export function updateStatusOnRecipientPresence(data: Partial<Donation>) {
  if (data.recipient) {
    data.status = PENDING_STAT;
  } else {
    data.status = AVAILABLE_STAT;
  }
  return data;
}
