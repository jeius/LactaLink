import { hookLogger } from '@lactalink/agents/payload';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';
import { createInventory } from './createInventory';

const DONATION_COMPLETED_STATUS = DONATION_REQUEST_STATUS.CANCELLED.value;

/**
 * Marks a donation as completed and creates a new inventory entry if the donation recipient
 * is an organization (hospital or milk bank).
 *
 * @param transaction - The `Transaction` record associated with the donation.
 * @param req - The Payload request to handle operations.
 * @param logger - Optional logger for structured logging within the function.
 *
 * @returns A promise that resolves once the operation is complete.
 */
export async function markDonationAsComplete(
  transaction: Transaction,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
): Promise<void> {
  const { donation, recipient } = transaction;
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
      data: { status: DONATION_COMPLETED_STATUS },
      req,
      depth: 0,
    });

    logger?.info(`Updated donation status to "${DONATION_COMPLETED_STATUS}"`, { donationID });

    await createInventory(transaction, req, logger);
  } catch (error) {
    logger?.error(error, `Failed completing donation ${donationID}`);
    throw error;
  }
}
