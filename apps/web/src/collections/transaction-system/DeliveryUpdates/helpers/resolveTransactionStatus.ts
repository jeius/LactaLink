import { DELIVERY_OPTIONS, DELIVERY_UPDATES, TRANSACTION_STATUS } from '@lactalink/enums';
import type {
  DeliveryDetail,
  DeliveryUpdate,
  Transaction,
} from '@lactalink/types/payload-generated-types';

const PICKUP = DELIVERY_OPTIONS.PICKUP.value;
const DELIVERY_MODE = DELIVERY_OPTIONS.DELIVERY.value;
const MEETUP = DELIVERY_OPTIONS.MEETUP.value;
const TXN_PREPARING = TRANSACTION_STATUS.PREPARING.value;
const TXN_READY_FOR_PICKUP = TRANSACTION_STATUS.READY_FOR_PICKUP.value;
const TXN_IN_TRANSIT = TRANSACTION_STATUS.IN_TRANSIT.value;
const TXN_DELIVERED = TRANSACTION_STATUS.DELIVERED.value;
const TXN_COMPLETED = TRANSACTION_STATUS.COMPLETED.value;

/**
 * Resolves the target transaction status based on role, delivery mode, and the new
 * delivery update status.
 *
 * @description
 * Transition table:
 * - Sender + PICKUP_READY + PICKUP mode → READY_FOR_PICKUP
 * - Sender + ON_THE_WAY + DELIVERY/MEETUP mode → IN_TRANSIT
 * - Sender + DELIVERED + DELIVERY/MEETUP mode → DELIVERED
 * - Recipient + DELIVERED + PICKUP mode → COMPLETED (auto-complete, no donor confirmation needed)
 * - Recipient + COMPLETED (any mode) → COMPLETED
 *
 * @param updateStatus - The new delivery update status
 * @param mode - The accepted delivery method for the transaction
 * @param isSender - Whether the user who triggered the update is the sender
 * @param isRecipient - Whether the user who triggered the update is the recipient
 * @returns The new transaction status, or `null` if no transition applies
 */
export function resolveTransactionStatus({
  updateStatus,
  mode,
  isSender,
  isRecipient,
}: {
  updateStatus: DeliveryUpdate['status'];
  mode: DeliveryDetail['method'];
  isSender: boolean;
  isRecipient: boolean;
}): Transaction['status'] | null {
  if (isSender) {
    if (updateStatus === DELIVERY_UPDATES.PREPARING.value) return TXN_PREPARING;
    if (updateStatus === DELIVERY_UPDATES.PICKUP_READY.value && mode === PICKUP)
      return TXN_READY_FOR_PICKUP;
    if (
      updateStatus === DELIVERY_UPDATES.ON_THE_WAY.value &&
      (mode === DELIVERY_MODE || mode === MEETUP)
    )
      return TXN_IN_TRANSIT;
    if (
      updateStatus === DELIVERY_UPDATES.DELIVERED.value &&
      (mode === DELIVERY_MODE || mode === MEETUP)
    )
      return TXN_DELIVERED;
  }
  if (isRecipient) {
    if (updateStatus === DELIVERY_UPDATES.DELIVERED.value && mode === PICKUP) return TXN_COMPLETED;
    if (updateStatus === DELIVERY_UPDATES.COMPLETED.value) return TXN_COMPLETED;
  }
  return null;
}
