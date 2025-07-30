import { Donation } from '@lactalink/types';
import { extractErrorMessage, extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

/**
 * Processes a donation that was made directly to an organization (hospital or milk bank)
 * When the donation status becomes COMPLETED, creates an inventory entry for the organization
 */
export const processDonationToOrganization: CollectionAfterChangeHook<Donation> = async ({
  doc,
  previousDoc,
  req,
}) => {
  // Only proceed if:
  // 1. The donation has an organization recipient
  // 2. The status changed to COMPLETED
  // 3. There was a previous state (not a new donation)
  if (
    !doc.recipient ||
    doc.status !== 'COMPLETED' ||
    !previousDoc ||
    previousDoc.status === 'COMPLETED' ||
    !doc.details?.bags
  ) {
    return doc;
  }

  // Check if recipient is an organization (hospital or milk bank)
  const recipientType = doc.recipient.relationTo;

  if (recipientType !== 'hospitals' && recipientType !== 'milkBanks') {
    return doc; // Not an organization recipient
  }

  const recipientId = extractID(doc.recipient.value);

  // Create inventory entry with minimal required fields
  // The initializeInventory hook will populate the rest
  try {
    await req.payload.create({
      collection: 'inventory',
      data: {
        organization: {
          relationTo: recipientType,
          value: recipientId,
        },
        sourceDonation: doc.id,
        receivedAt: new Date().toISOString(),
        expiresAt: doc.expiredAt || undefined,
        status: 'AVAILABLE',
        initialVolume: doc.volume || 0,
        remainingVolume: doc.remainingVolume || 0,
        milkBags: extractID(doc.details.bags),
      },
    });

    req.payload.logger.info(
      `Created inventory entry for ${recipientType} ${recipientId} from donation ${doc.id}`
    );
  } catch (error) {
    req.payload.logger.error(
      `Failed to create inventory entry for donation ${doc.id}: ${extractErrorMessage(error)}`
    );
  }

  return doc;
};
