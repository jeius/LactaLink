import { hookLogger } from '@lactalink/agents/payload';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook, PayloadRequest } from 'payload';
import {
  clearTransactionReads,
  createStatusHistoryRecord,
  markBagsAsAllocated,
  markDonationAsComplete,
  markDonationAsMatched,
  markRequestAsComplete,
  markRequestAsMatched,
} from '../helpers';

const COMPLETE_STATUS = TRANSACTION_STATUS.COMPLETED.value;

/**
 * AfterChange hook for the Transactions collection.
 *
 * @description
 * Handles side effects related to transaction creation and updates, including:
 * - On create: Marking linked donation and request as matched, and marking included
 *   milk bags as allocated.
 * - On update: If status changes to completed, marking linked donation and request
 *   as complete. Also handles clearing transaction reads and creating status history
 *   records on any update.
 */
export const afterChange: CollectionAfterChangeHook<Transaction> = async ({
  doc,
  req,
  operation,
  previousDoc,
  collection,
}) => {
  const { user } = req;
  if (!user?.profile) return doc;

  const baseLogger = hookLogger(req, collection.slug, 'afterChange');

  try {
    if (operation === 'create') {
      const logger = hookLogger(req, collection.slug, 'afterCreate');

      // Update the milk bags first since the donation/request volumes and statuses
      // depends on the bags being allocated
      await markBagsAsAllocated(doc.milkBags, req, logger);

      await Promise.all([
        markDonationAsMatched(doc.donation, req, logger),
        markRequestAsMatched(doc.request, req, logger),
      ]);
    }

    if (operation === 'update') {
      const logger = hookLogger(req, collection.slug, 'afterUpdate');

      await Promise.allSettled([
        clearTransactionReads(doc, req, logger),
        createStatusHistoryRecord(doc, previousDoc, req, logger),
        finalizeOnComplete(doc, req, logger),
      ]);
    }

    return doc;
  } catch (error) {
    baseLogger.error(error, extractErrorMessage(error));
    throw error;
  }
};

/**
 * Helper function to finalize the transaction when completed.
 */
async function finalizeOnComplete(
  doc: Transaction,
  req: PayloadRequest,
  logger: ReturnType<typeof hookLogger>
) {
  if (doc.status !== COMPLETE_STATUS) return;
  await Promise.all([
    markRequestAsComplete(doc.request, req, logger),
    markDonationAsComplete(doc, req, logger),
  ]);
}
