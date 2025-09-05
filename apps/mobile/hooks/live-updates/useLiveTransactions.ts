import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useMemo } from 'react';
import { useMeUser } from '../auth/useAuth';
import { useRevalidateCollectionQueries } from '../collections/useRevalidateQueries';

const slug = 'transactions';

// Todo: Revise this implementation.
// Try listening to broadcast channel.
export function useLiveTransactions(callback?: () => void) {
  const meUser = useMeUser();
  const userID = meUser.data?.id.trim();
  const revalidateQuery = useRevalidateCollectionQueries();

  const revalidate = useCallback(() => {
    if (callback) {
      callback();
    } else {
      revalidateQuery(slug);
    }
  }, [callback, revalidateQuery]);

  const channel = useMemo(
    () =>
      supabase.channel(`table-${slug}-changes`).on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: slug,
        },
        (_payload) => {
          revalidate();
        }
      ),
    [revalidate]
  );

  useEffect(() => {
    if (userID) {
      channel.subscribe();
    } else {
      channel.unsubscribe();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channel, userID]);

  return channel;
}
