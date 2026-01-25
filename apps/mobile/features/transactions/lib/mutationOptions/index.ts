import { getTransactionService } from '@/lib/services';
import { DeliveryDetail, Transaction } from '@lactalink/types/payload-generated-types';
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
