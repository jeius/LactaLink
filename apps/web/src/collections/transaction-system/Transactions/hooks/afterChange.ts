import { hookLogger } from '@lactalink/agents/payload';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { CollectionAfterChangeHook } from 'payload';
import {
  clearTransactionReads,
  consumeRequestBags,
  createNewInventory,
  createStatusHistoryRecord,
  markBagsAsAllocated,
  markDonationAsMatched,
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
 * - On update: If status changes to completed, consuming allocated bags and creating
 *   inventory for organization donations. Also clears transaction reads and creates
 *   status history records on any update.
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

  const logger = hookLogger(req, collection.slug, 'afterChange');

  try {
    if (operation === 'update') {
      const onTransactionCompleted = async () => {
        if (doc.status !== COMPLETE_STATUS) return;

        // Consume allocated bags linked to the transaction's request
        if (doc.request) await consumeRequestBags(doc.request, req, logger);

        // Create organization inventory if transaction has a linked donation
        // with an organization as recipient
        if (doc.donation) await createNewInventory(doc.donation, req, logger);
      };

      await Promise.all([
        clearTransactionReads(doc, req, logger),
        createStatusHistoryRecord(doc, previousDoc, req, logger),
        onTransactionCompleted(),
      ]);
    }

    if (operation === 'create') {
      await Promise.all([
        markDonationAsMatched(doc.donation, req),
        markRequestAsMatched(doc.request, req),
        markBagsAsAllocated(doc.milkBags, req),
      ]);
    }
  } catch (error) {
    req.payload.logger.error(error, 'Error in Transactions afterChange hook:');
    throw error;
  }

  return doc;
};
