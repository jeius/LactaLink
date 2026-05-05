import { getTransactionService } from '@/lib/services';
import {
  DeliveryDetail,
  DeliveryUpdate,
  Transaction,
  User,
} from '@lactalink/types/payload-generated-types';

import { mutationOptions } from '@tanstack/react-query';
import { addTransactionToAllCache } from '../cacheUtils';

export function createAgreeMutation(transaction: Transaction) {
  return mutationOptions({
    meta: {
      onError: () => 'Failed to accept delivery proposal. Please try again.',
    },
    mutationKey: ['transactions', 'agreeDelivery', transaction.id],
    mutationFn: async (deliveryDetail: DeliveryDetail) => {
      return getTransactionService().acceptDeliveryProposal(transaction, deliveryDetail);
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      addTransactionToAllCache(client, data);
    },
  });
}

export function createDisagreeMutation(transaction: Transaction) {
  return mutationOptions({
    meta: {
      onError: () => 'Failed to reject delivery proposal. Please try again.',
    },
    mutationKey: ['transactions', 'disagreeDelivery', transaction.id],
    mutationFn: async (deliveryDetail: DeliveryDetail) => {
      return getTransactionService().rejectDeliveryProposal(transaction, deliveryDetail);
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      addTransactionToAllCache(client, data);
    },
  });
}

type UpdateDeliveryParams = { markedBy: User; status: DeliveryUpdate['status'] };

/**
 * Mutation options for updating the current user's delivery status.
 *
 * @description
 * Calls {@link TransactionService.upsertDeliveryUpdate}, which upserts the user's
 * `DeliveryUpdate` record and returns the refreshed transaction after the backend hook
 * has auto-transitioned the transaction status.
 *
 * @param transaction - The transaction to update
 * @param onSuccess - Optional callback on success
 */
export function createUpdateDeliveryMutation(
  transaction: Transaction,
  onSuccess?: (data: Transaction) => void
) {
  return mutationOptions({
    meta: {
      onError: () => 'Failed to update delivery status. Please try again.',
    },
    mutationKey: ['transactions', 'updateDelivery', transaction.id],
    mutationFn: async ({ markedBy, status }: UpdateDeliveryParams) => {
      return getTransactionService().upsertDeliveryUpdate(transaction, markedBy, status);
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      addTransactionToAllCache(client, data);
      onSuccess?.(data);
    },
  });
}
