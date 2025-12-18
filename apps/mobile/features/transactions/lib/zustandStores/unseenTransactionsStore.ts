import { Transaction } from '@lactalink/types/payload-generated-types';
import { create } from 'zustand/react';

interface UnseenTransactionsState {
  /**
   * Map of unseen transactions
   */
  transactions: Map<string, Transaction>;
  /**
   * Actions to modify unseen transactions store
   */
  actions: {
    add: (transaction: Transaction | Transaction[]) => void;
    remove: (transactionID: string | string[]) => void;
    clear: () => void;
  };
}

const useUnseenTransactionsStore = create<UnseenTransactionsState>((set) => ({
  transactions: new Map<string, Transaction>(),
  actions: {
    add: (transaction) => {
      set((state) => {
        const newMap = new Map(state.transactions);
        const transactions = Array.isArray(transaction) ? transaction : [transaction];
        transactions.forEach((tx) => newMap.set(tx.id, tx));
        return { transactions: newMap };
      });
    },
    remove: (transactionID) => {
      set((state) => {
        const newMap = new Map(state.transactions);
        const transactions = Array.isArray(transactionID) ? transactionID : [transactionID];
        transactions.forEach((id) => newMap.delete(id));
        return { transactions: newMap };
      });
    },
    clear: () => {
      set({ transactions: new Map<string, Transaction>() });
    },
  },
}));

export const useUnseenTransactions = () =>
  useUnseenTransactionsStore((state) => state.transactions);

export const useUnseenTransactionsActions = () =>
  useUnseenTransactionsStore((state) => state.actions);

export const getUnseenTransactions = () => useUnseenTransactionsStore.getState().transactions;

export const getUnseenTransactionsActions = () => useUnseenTransactionsStore.getState().actions;

export function updateUnseenTransactionStore(doc: Transaction) {
  // Check if transaction is unseen
  const isUnseen = doc.tracking?.reads?.docs?.length === 0;

  // Add to unseen transactions store
  if (isUnseen) getUnseenTransactionsActions().add(doc);
  // Remove from unseen transactions store
  else getUnseenTransactionsActions().remove(doc.id);
}
