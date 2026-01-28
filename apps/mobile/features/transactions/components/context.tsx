import { supabase } from '@/lib/supabase';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { REALTIME_SUBSCRIBE_STATES, RealtimeChannel } from '@supabase/supabase-js';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { addTransactionToAllCache } from '../lib/cacheUtils';

interface RealtimeTransactionStore {
  transaction: Transaction;
  channel: RealtimeChannel | null;
  actions: {
    broadcastTxn: (transaction: Transaction) => void;
    subscribe: () => void;
    unsubscribe: () => void;
  };
}

const EVENT = 'update';

const TransactionContext = createContext<StoreApi<RealtimeTransactionStore> | null>(null);

export function useTransactionContext() {
  return useTransactionStore((state) => state.transaction);
}

export const useBroadcastTransaction = () =>
  useTransactionStore((state) => state.actions.broadcastTxn);

export function TransactionProvider({
  transaction,
  children,
}: PropsWithChildren<{ transaction: Transaction }>) {
  const queryClient = useQueryClient();
  const [store] = useState(() => createTxnStore(transaction, queryClient));

  useEffect(() => {
    store.setState({ transaction });
  }, [transaction, store]);

  useEffect(() => {
    const { subscribe, unsubscribe } = store.getState().actions;

    // Subscribe to the transaction channel on mount
    subscribe();

    return () => {
      // Unsubscribe from the transaction channel on unmount
      unsubscribe();
    };
  }, [store]);

  return <TransactionContext.Provider value={store}>{children}</TransactionContext.Provider>;
}

// #region Helpers
function createTxnStore(transaction: Transaction, queryClient: QueryClient) {
  return createStore<RealtimeTransactionStore>((set, get) => ({
    transaction,
    channel: null,
    actions: {
      broadcastTxn: (transaction: Transaction) => {
        const channel = get().channel;
        if (!channel) return; // Not subscribed

        // Broadcast the update
        channel
          .send({
            type: 'broadcast',
            event: EVENT,
            payload: transaction,
          })
          .catch((error) => {
            console.error('Error broadcasting transaction update:', error);
          });

        // Update local state
        set({ transaction });
        addTransactionToAllCache(queryClient, transaction);
      },
      subscribe: () => {
        if (get().channel) return; // Already subscribed

        const channel = supabase.channel(`transaction:${transaction.id}`);
        // Save channel to state
        set({ channel });

        // Channel listener
        channel.on<Transaction>('broadcast', { event: EVENT }, ({ payload }) => {
          set(() => ({ transaction: payload }));
          addTransactionToAllCache(queryClient, payload);
        });

        // Subscribe to channel
        channel.subscribe((status) => {
          if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
            // console.log('Subscribed to transaction channel:', transaction.id);
          }
        });
      },
      unsubscribe: () => {
        const channel = get().channel;
        if (!channel) return; // Not subscribed

        // Unsubscribe from channel
        supabase.removeChannel(channel).then((result) => {
          if (result === 'ok') {
            // console.log('Unsubscribed from transaction channel:', transaction.id);
            set({ channel: null });
          }
        });
      },
    },
  }));
}

function useTransactionStore<T>(selector: (state: RealtimeTransactionStore) => T) {
  const store = useContext(TransactionContext);
  if (!store) {
    throw new Error('useTransactionStore must be used within a TransactionProvider');
  }
  return useStore(store, selector);
}
