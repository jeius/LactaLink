import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';
import { allocateMilkBags, updateDonationOnCreate, updateRequestOnCreate } from '../helpers';
import { consumeRequestBags } from '../helpers/consumeMilkBags';

const completedTransactionStatus = TRANSACTION_STATUS.COMPLETED.value;

export const afterChange: CollectionAfterChangeHook<Transaction> = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  const { user } = req;
  if (!user?.profile) return doc;

  try {
    // On update operations
    if (operation === 'update') {
      // Update read records
      const { docs } = await req.payload.delete({
        collection: 'transaction-reads',
        where: { transaction: { equals: doc.id } },
        req,
      });

      req.payload.logger.info(
        `Deleted ${docs.length} transaction read records for transaction ${doc.id}`
      );

      // Add record in status history if status changed
      if (previousDoc?.status !== doc.status) {
        const isSender = isEqualProfiles(user.profile, doc.sender);
        const isReceiver = isEqualProfiles(user.profile, doc.recipient);
        const notes = `Status changed by ${isSender ? 'sender' : isReceiver ? 'receiver' : 'system'}.`;

        const history = await req.payload.create({
          collection: 'transaction-status-histories',
          data: { status: doc.status, transaction: doc.id, notes: notes },
          req,
        });

        req.payload.logger.info(
          `Created status history record ${history.id} for transaction ${doc.id} with status ${doc.status}`
        );

        if (doc.status === completedTransactionStatus) {
          // Consume allocated bags linked to the transaction's request
          if (doc.request) await consumeRequestBags({ id: doc.id, request: doc.request }, req);
        }
      }
    }

    // On create operations
    if (operation === 'create') {
      await Promise.all([
        updateDonationOnCreate(extractID(doc.donation), req),
        updateRequestOnCreate(extractID(doc.request), req),
        allocateMilkBags(extractID(doc.milkBags), req),
      ]);
    }
  } catch (error) {
    req.payload.logger.error(error, 'Error in Transactions afterChange hook:');
    throw error;
  }

  return doc;
};
