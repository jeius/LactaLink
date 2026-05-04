import { hookLogger } from '@lactalink/agents/payload';
import type { DeliveryUpdate } from '@lactalink/types/payload-generated-types';
import type { CollectionAfterChangeHook } from 'payload';
import { updateTransactionStatus } from '../helpers/updateTransactionStatus';

/**
 * After change hook for delivery updates. Handles updating the associated transaction status based on
 * the new delivery update status and the current user's role in the transaction.
 */
export const afterChange: CollectionAfterChangeHook<DeliveryUpdate> = async ({
  doc,
  req,
  previousDoc,
  operation,
  collection,
}) => {
  // Hooks for create operations here
  if (operation === 'create') {
    // Add any create-specific logic here if needed in the future
  }

  // Hooks for update operations here
  if (operation === 'update') {
    const logger = hookLogger(req, collection.slug, 'afterUpdate');

    if (previousDoc.status !== doc.status) {
      await updateTransactionStatus(req, doc, logger);
    }
  }

  return doc;
};
