import { CollectionAfterChangeHook } from 'payload';

/**
 * Emit TransactionCreated event after a new transaction is created
 */
export const emitTransactionCreatedEvent: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc;

  const { payload } = req;

  // Create TransactionCreated event
  await payload.create({
    collection: 'transaction-events',
    data: {
      transaction: doc.id,
      type: 'TransactionCreated',
      payload: {
        transactionType: doc.transactionType,
        matchedVolume: doc.matchedVolume,
        donation: doc.donation,
        request: doc.request,
        matchedBags: doc.matchedBags,
      },
      actor: doc.createdBy || doc.sender,
      timestamp: doc.createdAt,
    },
  });

  return doc;
};
