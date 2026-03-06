import { hookLogger } from '@lactalink/agents/payload';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

const DONATION_COMPLETED_STATUS = DONATION_REQUEST_STATUS.CANCELLED.value;

/**
 * Marks a donation as completed and creates a new inventory entry if the donation recipient
 * is an organization (hospital or milk bank).
 *
 * @param donation - The `Donation` record or ID being processed, which should have an organization recipient.
 * @param req - The Payload request to handle operations.
 * @param logger - Optional logger for structured logging within the function.
 *
 * @returns A promise that resolves once the operation is complete.
 */
export async function markDonationAsComplete(
  donation: string | Donation | null | undefined,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
): Promise<void> {
  if (!donation) {
    logger?.info('No donation provided, skipping donation completion process.');
    return;
  }

  const donationID = extractID(donation);

  try {
    // Update the donation status to `COMPLETED` and select necessary fields for inventory creation
    const donationDoc = await req.payload.update({
      collection: 'donations',
      id: donationID,
      req,
      depth: 0,
      data: { status: DONATION_COMPLETED_STATUS },
      select: { recipient: true, volume: true, expiredAt: true, remainingVolume: true },
    });

    logger?.info(`Updated donation status to "${DONATION_COMPLETED_STATUS}"`, { donationID });

    await Promise.all([
      createNewInventory(donationDoc, req, logger),
      // Add more parallel operations here if needed in the future...
    ]);
  } catch (error) {
    logger?.error(error, `Failed completing donation ${donationID}`);
    throw error;
  }
}

/**
 * Helper function to create a new inventory entry from a completed donation if the recipient is an organization.
 */
async function createNewInventory(
  donation: Pick<Donation, 'id' | 'recipient' | 'volume' | 'expiredAt' | 'remainingVolume'>,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  // Only proceed if the donation has recipient
  if (!donation.recipient) return;

  const recipientSlug = donation.recipient.relationTo;
  const recipientId = extractID(donation.recipient.value);

  // Only proceed if recipient is an organization (hospital or milk bank)
  if (recipientSlug === 'individuals') return;

  // We don't create new inventory if the donation is already linked to an existing
  // inventory entry under the same organization (e.g., from a previous completion process)
  const existingInventories = await req.payload.find({
    collection: 'inventories',
    depth: 0,
    limit: 1,
    pagination: false,
    req,
    where: {
      and: [
        { sourceDonation: { equals: donation.id } },
        { 'organization.value': { equals: recipientId } },
        { 'organization.relationTo': { equals: recipientSlug } },
      ],
    },
  });

  if (existingInventories.docs.length > 0) {
    logger?.info(
      `Donation already linked to an existing inventory entry, skipping inventory creation`,
      {
        donationID: donation.id,
        existingInventory: existingInventories.docs[0]!,
      }
    );
    return existingInventories.docs[0]!;
  }

  // At this point, we are ready to create a new inventory entry for the completed donation.
  // @ts-expect-error - `code` field will throw an error since it is a required field.
  // However, it is auto-generated from the backend, so it is safe to ignore this error here.
  const newInventory = await req.payload.create({
    collection: 'inventories',
    req,
    depth: 0,
    data: {
      organization: { relationTo: recipientSlug, value: recipientId },
      sourceDonation: donation.id,
      receivedAt: new Date().toISOString(),
      expiresAt: donation.expiredAt || undefined,
      status: 'AVAILABLE',
      initialVolume: donation.volume || 0,
      remainingVolume: donation.remainingVolume || 0,
      code: undefined, // Let the backend auto-generate the code
    },
  });

  logger?.info(`Created new inventory entry from donation`, {
    inventoryID: newInventory.id,
    organization: donation.recipient,
  });

  return newInventory;
}
