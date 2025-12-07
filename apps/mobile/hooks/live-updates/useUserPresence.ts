import { supabase } from '@/lib/supabase';
import { DBUser } from '@lactalink/types/database';
import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { REALTIME_SUBSCRIBE_STATES, RealtimeChannel } from '@supabase/supabase-js';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Presence = {
  isOnline: boolean;
  lastOnlineAt: string | undefined;
};

export function useUserPresence(user: string | User | null | undefined): Presence {
  const userDoc = extractCollection(user);

  const [onlineAt, setOnlineAt] = useState(
    userDoc?.onlineAt || userDoc?.createdAt || new Date().toISOString()
  );

  const isOnline = useMemo(() => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(onlineAt).getTime();
    const diffInSeconds = diffInMs / 1000;
    return diffInSeconds < 15; // Consider online if last onlineAt is within last 15 seconds
  }, [onlineAt]);

  const isSubscribedRef = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Cleanup previous channel if conversation changed
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    const channel = supabase.channel('users-activity');
    channelRef.current = channel;

    channel.on<DBUser>(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${extractID(user)}`,
      },
      ({ new: user }) => {
        setOnlineAt(user.online_at || user.created_at);
      }
    );

    // Subscribe to channel
    channel.subscribe((status) => {
      const isSubscribed = status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED;
      isSubscribedRef.current = isSubscribed;
    });

    // Cleanup on unmount or conversation change
    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      isSubscribedRef.current = false;
    };
  }, [user]);

  // Handle focus/blur for subscription management
  useFocusEffect(
    useCallback(() => {
      // Resubscribe when screen is focused
      if (channelRef.current && !isSubscribedRef.current) {
        channelRef.current.subscribe((status) => {
          isSubscribedRef.current = status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED;
        });
      }

      return () => {
        // Unsubscribe when screen loses focus
        if (channelRef.current && isSubscribedRef.current) {
          channelRef.current.unsubscribe();
          isSubscribedRef.current = false;
        }
      };
    }, [])
  );

  return { isOnline: isOnline, lastOnlineAt: onlineAt };
}
