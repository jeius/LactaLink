import { QUERY_KEYS } from '@/lib/constants';
import { getTransactionService } from '@/lib/services';
import { getMeUser } from '@/lib/stores/meUserStore';
import { createTempID } from '@/lib/utils/tempID';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { useMutation } from '@tanstack/react-query';
import { produce } from 'immer';
import { addTransactionToAllCache } from '../lib/cacheUtils';

export function useTransactionState(transaction: Transaction) {
  const unread = transaction.tracking?.reads?.docs?.length === 0;
  const meUser = getMeUser();

  const mutation = useMutation({
    mutationKey: ['transactions', 'mark-read', transaction.id],
    mutationFn: () => {
      if (!unread) return Promise.resolve(null);
      const service = getTransactionService();
      return service.markAsRead(transaction);
    },
    onMutate: (_, { client }) => {
      if (!unread || !meUser) return;

      const oldTransaction = transaction;

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      client.cancelQueries({ queryKey: QUERY_KEYS.TRANSACTIONS.ALL });

      // Optimistic update
      const optimisticTransaction = produce(transaction, (draft) => {
        const readDocs = draft.tracking?.reads?.docs || [];
        readDocs.push({
          id: createTempID(),
          transaction: transaction,
          user: meUser,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        draft.tracking.reads = {
          ...draft.tracking.reads,
          docs: readDocs,
          totalDocs: readDocs.length,
        };
      });

      addTransactionToAllCache(client, optimisticTransaction);

      return { oldTransaction };
    },
    onError: (_err, _var, ctx, { client }) => {
      if (ctx?.oldTransaction) addTransactionToAllCache(client, ctx.oldTransaction);
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      // Only refetch the infinite transactions query since it will update the single
      // transaction query as well
      if (data) addTransactionToAllCache(client, data);
    },
  });

  return {
    isUnseen: unread,
    markAsSeen: () => mutation.mutate(),
    isPending: mutation.isPending,
  };
}
