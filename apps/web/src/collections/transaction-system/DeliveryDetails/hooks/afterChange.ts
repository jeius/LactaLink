import { DELIVERY_DETAILS_STATUS, TRANSACTION_STATUS } from '@lactalink/enums';
import { DeliveryDetail } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
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

  try {
    const updateTxnToConfirmed = () =>
      payload.update({
        req,
        collection: 'transactions',
        id: extractID(doc.transaction),
        data: { status: TXN_CONFIRMED },
      });

    // If delivery is created with ACCEPTED status, update transaction status to CONFIRMED
    if (operation === 'create' && doc.status === ACCEPTED) {
      const updatedTxn = await updateTxnToConfirmed();
      payload.logger.info(
        `Transaction ${updatedTxn.id} status updated to ${TXN_CONFIRMED} after confirmed delivery details creation`
      );
    }

    // If status have changed from PENDING to ACCEPTED, update transaction status
    // to CONFIRMED
    if (operation === 'update' && previousDoc?.status === PENDING && doc.status === ACCEPTED) {
      const updatedTxn = await updateTxnToConfirmed();
      payload.logger.info(
        `Transaction ${updatedTxn.id} status updated to ${TXN_CONFIRMED} after delivery proposal accepted`
      );
    }
  } catch (error) {
    payload.logger.error(error, 'Error in DeliveryDetails afterChange hook:');
    throw error;
  }
  return doc;
};
