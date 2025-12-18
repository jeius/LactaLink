import { supabase } from '@/lib/supabase';
import { DBTransaction } from '@lactalink/types/database';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { REALTIME_SUBSCRIBE_STATES, RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { addTransactionToAllCache } from '../lib/cacheUtils';
import { fetchTransaction } from '../lib/findDocs';
import { createTransactionChannel } from '../lib/realtime/channels';

export function useTransactionChannel(transaction: Transaction) {
  const queryClient = useQueryClient();

  const { channel, isSubscribed } = useMemo(
    () => createTransactionChannel(transaction),
    [transaction]
  );

  const isSubscribedRef = useRef(isSubscribed);
  const channelRef = useRef<RealtimeChannel>(null);

  useEffect(() => {
    // Cleanup previous channel if transaction changed
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    // Assign new channel and subscription status
    channelRef.current = channel;
    isSubscribedRef.current = isSubscribed;

    const transactionID = extractID(transaction);

    channel.on<DBTransaction>(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions',
        filter: `id=eq.${transactionID}`,
      },
      async (payload) => {
        await fetchTransaction(payload.new.id).then((doc) => {
          addTransactionToAllCache(queryClient, doc);
        });
      }
    );

    if (!isSubscribedRef.current) {
      channel.subscribe((status) => {
        const isSubscribed = status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED;
        isSubscribedRef.current = isSubscribed;
      });
    }

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      isSubscribedRef.current = false;
    };
  }, [channel, isSubscribed, queryClient, transaction]);
}
