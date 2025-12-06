import { supabase } from '@/lib/supabase';
import { DBUser } from '@lactalink/types/database';
import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Presence = {
  isOnline: boolean;
  lastOnlineAt: string | undefined;
};

export function useUserPresence(user: string | User) {
  const [presence, setPresence] = useState<Presence>({
    isOnline: false,
    lastOnlineAt: extractCollection(user)?.createdAt,
  });

  const channelSubscribedRef = useRef(false);

  const channel = useMemo(() => {
    const channel = supabase.channel('users-activity');

    channel.on<DBUser>(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${extractID(user)}`,
      },
      ({ new: user }) => {
        const now = new Date();
        const onlineAt = new Date(user.online_at || user.created_at);

        const diffInMs = now.getTime() - onlineAt.getTime();
        const diffInSeconds = diffInMs / 1000;
        setPresence({
          isOnline: diffInSeconds < 30,
          lastOnlineAt: user.online_at || user.created_at,
        });
      }
    );

    return channel;
  }, [user]);

  const unsubscribe = useCallback(() => {
    if (channelSubscribedRef.current) return;
    channel.unsubscribe();
    channelSubscribedRef.current = false;
  }, [channel]);

  useFocusEffect(
    useCallback(() => {
      channel.subscribe((status) => {
        const isSubscribed = status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED;
        channelSubscribedRef.current = isSubscribed;
      });
      return () => unsubscribe();
    }, [channel, unsubscribe])
  );

  useEffect(() => {
    return () => unsubscribe();
  }, [unsubscribe]);

  return presence;
}
