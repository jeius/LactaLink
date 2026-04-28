import { QUERY_KEYS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useMeUser } from '../auth/useAuth';

const TABLE: Extract<CollectionSlug, 'notifications'> = 'notifications';

export function useLiveNotifications() {
  const queryClient = useQueryClient();

  const { data: meUser } = useMeUser();
  const userID = meUser?.id.trim();

  const channelRef = useRef<RealtimeChannel>(null);

  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = !userID
      ? null
      : supabase.channel('table-notifications-inserts').on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: TABLE,
            filter: `recipient_id=eq.${userID}`,
          },
          async (_payload) => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
          }
        );

    if (channel) {
      channel.subscribe((_status, err) => {
        if (err) {
          console.error('Failed to subscribe to notifications channel:', err);
        }
      });
      channelRef.current = channel;
    }

    return () => {
      if (!channel) return;
      supabase.removeChannel(channel);
    };
  }, [queryClient, userID]);
}
