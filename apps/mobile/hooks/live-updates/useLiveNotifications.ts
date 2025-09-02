import { useHomeTabsBadgeStore } from '@/lib/stores/homeTabBadgeStore';
import { supabase } from '@/lib/supabase';
import { useEffect, useMemo } from 'react';
import { useMeUser } from '../auth/useAuth';
import { useRevalidateCollectionQueries } from '../collections/useRevalidateQueries';

const slug = 'notifications';

export function useLiveNotifications() {
  const meUser = useMeUser();
  const revalidate = useRevalidateCollectionQueries();

  const incrementBadge = useHomeTabsBadgeStore((s) => s.incrementBadge);

  const channel = useMemo(
    () =>
      supabase.channel('table-notifications-inserts').on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: slug,
          filter: `recipient=eq.${meUser.data?.id || 'null'}`,
        },
        (_payload) => {
          revalidate(slug);
          incrementBadge(slug);
        }
      ),
    [incrementBadge, meUser.data?.id, revalidate]
  );

  useEffect(() => {
    if (meUser.data) {
      channel.subscribe();
    } else {
      channel.unsubscribe();
    }

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meUser.data]);

  return channel;
}
