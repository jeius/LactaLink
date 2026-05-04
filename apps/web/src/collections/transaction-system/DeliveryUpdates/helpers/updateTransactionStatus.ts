import { hookLogger } from '@lactalink/agents/payload';
import { DELIVERY_DETAILS_STATUS } from '@lactalink/enums';
import { DeliveryUpdate } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';
import { resolveTransactionStatus } from './resolveTransactionStatus';

const ACCEPTED = DELIVERY_DETAILS_STATUS.ACCEPTED.value;

/**
 * AfterChange hook for the `delivery-updates` collection.
 *
 * @description
 * Automatically transitions the parent transaction status when a delivery update
 * status changes. Determines whether the acting user is the sender or recipient by
 * comparing the delivery-update's `user` ID against the `owner` of each party's profile
 * document, then applies the transition mapping via {@link resolveTransactionStatus}.
 *
 * No-op cases (returns early without patching the transaction):
 * - No accepted delivery detail found for the transaction
 * - Resolved new status is the same as the current transaction status
 *
 * PICKUP auto-complete: when the recipient sets status to `DELIVERED` (milk picked up),
 * the transaction moves directly to `COMPLETED` without requiring a separate donor
 * confirmation step.
 */
export async function updateTransactionStatus(
  req: PayloadRequest,
  doc: DeliveryUpdate,
  logger?: ReturnType<typeof hookLogger>
) {
  const { payload } = req;

  try {
    const transactionID = extractID(doc.transaction);

    const { docs: deliveryDetails } = await payload.find({
      req,
      collection: 'delivery-details',
      where: {
        and: [{ transaction: { equals: transactionID } }, { status: { equals: ACCEPTED } }],
      },
      depth: 0,
      limit: 1,
      pagination: false,
    });

    const acceptedDetail = deliveryDetails[0];
    if (!acceptedDetail) {
      logger?.warn(`No accepted delivery detail for txn ${transactionID}, skipping transition`);
      return;
    }

    const transaction = await payload.findByID({
      req,
      collection: 'transactions',
      id: transactionID,
      depth: 1,
    });

    const deliveryUpdateUserID = extractID(doc.user);
    const senderDoc = extractCollection(transaction.sender.value);
    const recipientDoc = extractCollection(transaction.recipient.value);
    const isSender = !!senderDoc && deliveryUpdateUserID === extractID(senderDoc.owner);
    const isRecipient = !!recipientDoc && deliveryUpdateUserID === extractID(recipientDoc.owner);

    const newStatus = resolveTransactionStatus({
      updateStatus: doc.status,
      mode: acceptedDetail.method,
      isSender,
      isRecipient,
    });

    if (!newStatus || newStatus === transaction.status) return;

    await payload.update({
      req,
      collection: 'transactions',
      id: transactionID,
      data: { status: newStatus },
      depth: 0,
    });

    logger?.info(
      `Txn ${transactionID} → ${newStatus} (${isSender ? 'sender' : 'recipient'}, mode: ${acceptedDetail.method})`
    );
  } catch (error) {
    logger?.error(error, extractErrorMessage(error));
    throw error;
  }
}
