import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';

const COMPLETED = DONATION_REQUEST_STATUS.COMPLETED.value;

/**
 * Processes a donation that was made directly to an organization (hospital or milk bank)
 * Creates a transaction with fixed delivery mode and then creates inventory when completed
 */
export const processDonationToOrganization: CollectionAfterChangeHook<Donation> = async ({
  doc,
  previousDoc,
  req,
}) => {
  // Only proceed if the donation has an organization recipient
  if (!doc.recipient) {
    return doc;
  }

  // Check if recipient is an organization (hospital or milk bank)
  const recipientType = doc.recipient.relationTo;

  if (recipientType !== 'hospitals' && recipientType !== 'milkBanks') {
    return doc; // Not an organization recipient
  }

  const recipientId = extractID(doc.recipient.value);

  try {
    // If status changed to COMPLETED, create inventory entry
    if (doc.status === COMPLETED && previousDoc?.status !== COMPLETED && doc.details?.bags) {
      // Create inventory entry
      await req.payload.create({
        collection: 'inventory',
        req,
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
    }
  } catch (error) {
    req.payload.logger.error(
      `Failed to process organization donation ${doc.id}: ${extractErrorMessage(error)}`
    );
  }

  return doc;
};
