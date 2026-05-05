import { getMeUser } from '@/lib/stores/meUserStore';
import { isMeProfile } from '@/lib/utils/isMeUser';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { DeliveryUpdate, Transaction } from '@lactalink/types/payload-generated-types';
import { useMutation } from '@tanstack/react-query';
import { useBroadcastTransaction } from '../components/context';
import { extractDeliveryDetail, extractDeliveryUpdate } from '../lib/extractors';
import { createUpdateDeliveryMutation } from '../lib/mutationOptions';
import { resolveDeliveryActions } from '../lib/resolveDeliveryActions';

const TXN_CONFIRMED = TRANSACTION_STATUS.CONFIRMED.value;
const TXN_PREPARING = TRANSACTION_STATUS.PREPARING.value;
const TXN_READY_FOR_PICKUP = TRANSACTION_STATUS.READY_FOR_PICKUP.value;
const TXN_IN_TRANSIT = TRANSACTION_STATUS.IN_TRANSIT.value;
const TXN_DELIVERED = TRANSACTION_STATUS.DELIVERED.value;

/**
 * Hook that computes the available delivery execution actions for the current user
 * based on their role, the accepted delivery mode, and the current delivery update status.
 *
 * @description
 * Wraps a single `upsertDeliveryUpdate` mutation and derives which CTAs should be shown.
 * The primary action is the first returned action; subsequent actions are secondary.
 * After a successful mutation the updated transaction is broadcast via Supabase Realtime
 * so the other party sees the change immediately.
 *
 * Returns `null` for `actions` when:
 * - No accepted delivery detail exists on the transaction
 * - The transaction is in a terminal state (COMPLETED, CANCELLED, FAILED)
 * - The user's role cannot yet act (e.g. recipient waiting for donor to be ready)
 *
 * @param transaction - The current transaction document (depth ≥ 3)
 */
export function useDeliveryActions(transaction: Transaction) {
  const meUser = getMeUser();
  const broadcastTxn = useBroadcastTransaction();

  const deliveryDetail = extractDeliveryDetail(transaction);

  const mutation = useMutation(createUpdateDeliveryMutation(transaction, broadcastTxn));

  if (!meUser || !deliveryDetail) {
    return { actions: null, isPending: false, mutate: mutation.mutate };
  }

  const txnStatus = transaction.status;
  const terminalStatuses: Transaction['status'][] = [
    TRANSACTION_STATUS.COMPLETED.value,
    TRANSACTION_STATUS.CANCELLED.value,
    TRANSACTION_STATUS.FAILED.value,
  ];
  if (terminalStatuses.includes(txnStatus)) {
    return { actions: null, isPending: false, mutate: mutation.mutate };
  }

  // Only show CTAs once the delivery plan is confirmed
  const activeTxnStatuses: Transaction['status'][] = [
    TXN_CONFIRMED,
    TXN_PREPARING,
    TXN_READY_FOR_PICKUP,
    TXN_IN_TRANSIT,
    TXN_DELIVERED,
  ];
  if (!activeTxnStatuses.includes(txnStatus)) {
    return { actions: null, isPending: false, mutate: mutation.mutate };
  }

  const isSender = isMeProfile(transaction.sender);
  const myUpdate = extractDeliveryUpdate(transaction, meUser);
  const myUpdateStatus = myUpdate?.status ?? null;

  const actions = resolveDeliveryActions(
    myUpdateStatus,
    txnStatus,
    isSender,
    deliveryDetail.method
  );

  return {
    /** Ordered list of available CTA actions, or empty when no action is available */
    actions: actions.length > 0 ? actions : null,
    isPending: mutation.isPending,
    /**
     * Triggers the delivery status update mutation.
     * @param status - The new delivery update status
     */
    mutate: (status: DeliveryUpdate['status']) => mutation.mutate({ markedBy: meUser, status }),
    mutateAsync: async (status: DeliveryUpdate['status']) =>
      mutation.mutateAsync({ markedBy: meUser, status }),
  };
}
