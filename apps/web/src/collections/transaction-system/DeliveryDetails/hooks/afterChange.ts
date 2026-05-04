import { hookLogger } from '@lactalink/agents/payload';
import { DELIVERY_DETAILS_STATUS, DELIVERY_UPDATES, TRANSACTION_STATUS } from '@lactalink/enums';
import { DeliveryDetail } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook, PayloadRequest } from 'payload';

const PENDING = DELIVERY_DETAILS_STATUS.PENDING.value;
const ACCEPTED = DELIVERY_DETAILS_STATUS.ACCEPTED.value;
const TXN_CONFIRMED = TRANSACTION_STATUS.CONFIRMED.value;

/**
 * After a delivery detail is created/updated, update the associated transaction status
 */
export const afterChange: CollectionAfterChangeHook<DeliveryDetail> = async ({
  doc,
  req,
  previousDoc,
  operation,
  collection,
}) => {
  // Hooks for create operations here
  if (operation === 'create') {
    const logger = hookLogger(req, collection.slug, 'afterCreate');

    if (doc.status === ACCEPTED) {
      await handleAcceptedStatusChange(req, doc, logger);
    }
  }

  // Hooks for update operations here
  if (operation === 'update') {
    const logger = hookLogger(req, collection.slug, 'afterUpdate');

    if (previousDoc.status === PENDING && doc.status === ACCEPTED) {
      await handleAcceptedStatusChange(req, doc, logger);
    }
  }

  return doc;
};

// #region Helpers
async function handleAcceptedStatusChange(
  req: PayloadRequest,
  doc: DeliveryDetail,
  logger?: ReturnType<typeof hookLogger>
) {
  try {
    // Update transaction status to CONFIRMED
    const transaction = await req.payload.update({
      req,
      collection: 'transactions',
      id: extractID(doc.transaction),
      data: { status: TXN_CONFIRMED },
      depth: 3,
    });

    logger?.info(
      `Transaction ${transaction.id} status updated to ${TXN_CONFIRMED} after confirmed delivery details creation`
    );

    // Create delivery updates for both sender and recipient
    const { id, sender, recipient } = transaction;

    const deliveryUpdates = (
      await Promise.all(
        [sender, recipient].map(async ({ value }) => {
          const user = extractCollection(value)?.owner;

          if (!user) {
            logger?.warn('Cannot create delivery update: sender/recipient owner not found');
            return null;
          }

          return req.payload.create({
            req,
            collection: 'delivery-updates',
            data: {
              transaction: id,
              status: DELIVERY_UPDATES.WAITING.value,
              user: extractID(user),
            },
          });
        })
      )
    ).filter((v) => v !== null);

    if (deliveryUpdates.length > 0) {
      logger?.info(
        `Created ${deliveryUpdates.length} delivery updates for transaction ${id} after confirmed delivery details creation`
      );
    } else {
      logger?.warn(
        `No delivery updates created for transaction ${id} after confirmed delivery details creation`
      );
    }
  } catch (error) {
    logger?.error(error, extractErrorMessage(error));
    throw error;
  }
}
// #endregion
