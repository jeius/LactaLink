import { useApiClient } from '@lactalink/api';
import { DBMessage } from '@lactalink/types/database';
import { Conversation, Message } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createChatChannel } from '../lib/realtime/channels';

export function useChatChannel(conversation: string | Conversation) {
  const apiClient = useApiClient();

  const isSubscribedRef = useRef(false);

  const [newMessage, setNewMessage] = useState<Message | null>(null);

  const channel = useMemo(() => {
    const channel = createChatChannel(conversation);

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
    });

    channel.on<DBMessage>(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${extractID(conversation)}`,
      },
      async ({ new: message }) => {
        const messageDoc = await apiClient.findByID({
          id: message.id,
          collection: 'messages',
          depth: 4,
        });
        setNewMessage(messageDoc);
      }
    );

    return channel;
  }, [apiClient, conversation]);

  const unsubscribe = useCallback(() => {
    if (isSubscribedRef.current) return;
    channel.unsubscribe();
    isSubscribedRef.current = false;
  }, [channel]);

  useFocusEffect(
    useCallback(() => {
      channel.subscribe((status) => {
        const isSubscribed = status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED;
        isSubscribedRef.current = isSubscribed;
      });
      return () => unsubscribe();
    }, [channel, unsubscribe])
  );

  useEffect(() => {
    return () => unsubscribe();
  }, [unsubscribe]);

  return { newMessage, channel };
}
