import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import { getTransactionService } from '@/lib/services';
import { getMeUser } from '@/lib/stores/meUserStore';
import { createTempID } from '@/lib/utils/tempID';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { useRecyclingState } from '@shopify/flash-list';
import { useMutation } from '@tanstack/react-query';
import { produce } from 'immer';
import { addTransactionToAllCache } from '../lib/cacheUtils';
import { getUnseenTransactionsActions } from '../lib/zustandStores/unseenTransactionsStore';

export function useTransactionState(transaction: Transaction) {
  const unread = transaction.tracking?.reads?.docs?.length === 0;
  const [isUnseen, setIsUnseen] = useRecyclingState(unread, [unread]);

  const mutation = useMutation({
    mutationKey: ['transactions', 'mark-read'],
    mutationFn: () => {
      const service = getTransactionService();
      return service.markAsRead(transaction);
    },
    onMutate: (_, { client }) => {
      setIsUnseen(false);
      // Update unseen transactions store
      getUnseenTransactionsActions().remove(transaction.id);

      // Optimistic update
      const optimisticTransaction = produce(transaction, (draft) => {
        const readDocs = draft.tracking?.reads?.docs || [];
        readDocs.push({
          id: createTempID(),
          transaction: draft,
          user: getMeUser()!,
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
    },
    onError: (_err, _var, _ctx, { client }) => {
      setIsUnseen(true);
      // Revert unseen transactions store
      getUnseenTransactionsActions().add(transaction);
      // Revert the transaction cache
      addTransactionToAllCache(client, transaction);
    },
    onSuccess: (_data, _vars, _ctx, { client }) => {
      // Only refetch the infinite transactions query since it will update the single
      // transaction query as well
      client.refetchQueries({ queryKey: QUERY_KEYS.TRANSACTIONS.INFINITE });
    },
  });

  return {
    isUnseen,
    markAsSeen: () => mutation.mutate(),
    isPending: mutation.isPending,
  };
}
