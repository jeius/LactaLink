import { DELIVERY_DETAILS_STATUS, DELIVERY_UPDATES, TRANSACTION_STATUS } from '@lactalink/enums';
import { DeliveryDetail, Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';

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
}) => {
  const { payload } = req;

  const updateTxnToConfirmed = () =>
    payload.update({
      req,
      collection: 'transactions',
      id: extractID(doc.transaction),
      data: { status: TXN_CONFIRMED },
      depth: 3,
    });

  const createDeliveryUpdates = (transaction: Transaction) => {
    const { id, sender, recipient } = transaction;
    return Promise.all(
      [sender, recipient].map(async ({ value }) => {
        const user = extractCollection(value)?.owner;

        if (!user) {
          payload.logger.warn('Cannot create delivery update: sender/recipient owner not found');
          return Promise.resolve(null);
        }

        return payload.create({
          req,
          collection: 'delivery-updates',
          data: {
            transaction: id,
            status: DELIVERY_UPDATES.WAITING.value,
            user: extractID(user),
          },
        });
      })
    );
  };

  const executeHook = async () => {
    const updatedTxn = await updateTxnToConfirmed();
    payload.logger.info(
      `Transaction ${updatedTxn.id} status updated to ${TXN_CONFIRMED} after confirmed delivery details creation`
    );

    // Create delivery updates for both sender and recipient
    const deliveryUpdates = (await createDeliveryUpdates(updatedTxn)).filter((v) => v !== null);

    if (deliveryUpdates.length === 0) {
      payload.logger.warn(`No delivery updates were created for transaction ${updatedTxn.id}`);
    } else {
      payload.logger.info(
        `Delivery updates created for transaction ${updatedTxn.id} after confirmed delivery details creation`
      );
    }
  };

  try {
    // If delivery is created with ACCEPTED status, update transaction status to CONFIRMED
    if (operation === 'create' && doc.status === ACCEPTED) {
      await executeHook();
    }

    // If status have changed from PENDING to ACCEPTED, update transaction status
    // to CONFIRMED
    if (operation === 'update' && previousDoc?.status === PENDING && doc.status === ACCEPTED) {
      await executeHook();
    }
  } catch (error) {
    payload.logger.error(error, 'Error in DeliveryDetails afterChange hook:');
    throw error;
  }
  return doc;
};
