import { hookLogger } from '@lactalink/agents/payload';
import { Donation, Inventory } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

/**
 * Creates a new inventory entry based on a completed donation to an organization (hospital or milk bank).
 * @description This function creates an inventory entry using the details from the donation, such as the
 * organization recipient, volume, and expiration date.
 *
 * @param donation - The `Donation` record or ID being processed, which should have an organization recipient.
 * @param req - The Payload request to handle operations.
 * @param logger - Optional logger for structured logging within the function.
 * @returns The newly created `Inventory` record with `depth=0`, or null if the inventory was not created (e.g., if the donation recipient is not an organization).
 */
export async function createNewInventory(
  donation: string | Donation,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
): Promise<Inventory | null> {
  const donationID = extractID(donation);

  logger?.info(`Processing donation ${donationID} for organization inventory creation...`);

  const donationDoc =
    extractCollection(donation) ??
    (await req.payload.findByID({
      collection: 'donations',
      id: donationID,
      req,
      depth: 0,
      select: {
        recipient: true,
        volume: true,
        expiredAt: true,
        remainingVolume: true,
        status: true,
      },
    }));

  // Only proceed if the donation has an organization recipient
  if (!donationDoc.recipient) return null;

  const recipientSlug = donationDoc.recipient.relationTo;
  const recipientId = extractID(donationDoc.recipient.value);

  // Only proceed if recipient is an organization (hospital or milk bank)
  if (recipientSlug === 'individuals') return null;

  try {
    //@ts-expect-error - `code` field will throw an error since it is a required field.
    // However, it is auto-generated from the backend, so it is safe to ignore this error here.
    const newInventory = await req.payload.create({
      collection: 'inventories',
      req,
      depth: 0,
      data: {
        organization: { relationTo: recipientSlug, value: recipientId },
        sourceDonation: donationID,
        receivedAt: new Date().toISOString(),
        expiresAt: donationDoc.expiredAt || undefined,
        status: 'AVAILABLE',
        initialVolume: donationDoc.volume || 0,
        remainingVolume: donationDoc.remainingVolume || 0,
      },
    });

    logger?.info(`Created new inventory ${newInventory.code}`);
    return newInventory;
  } catch (error) {
    logger?.error(error, `Failed to create inventory: ${extractErrorMessage(error)}`);
    return null;
  }
}
