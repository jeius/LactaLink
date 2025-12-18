import { supabase } from '@/lib/supabase';
import { getApiClient } from '@lactalink/api';
import { DBMessage } from '@lactalink/types/database';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { REALTIME_SUBSCRIBE_STATES, RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { addMessageToInfiniteCache } from '../../lib/chatCacheUtils';
import { createGeneralChatsChannel } from '../../lib/realtime/channels';

export function useChatsChannel(conversations: Conversation[]) {
  const queryClient = useQueryClient();

  const { channel, isSubscribed } = createGeneralChatsChannel();

  const isSubscribedRef = useRef(isSubscribed);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const conversationMap = useMemo(() => {
    const map = new Map(conversations.map((c) => [extractID(c), c]));
    return map;
  }, [conversations]);

  useEffect(() => {
    const conversationIDs = extractID(conversations);

    // Cleanup previous channel if conversation changed
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    // Assign new channel and subscription status
    channelRef.current = channel;
    isSubscribedRef.current = isSubscribed;

    // Listen for new messages
    channel.on<DBMessage>(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=in.(${conversationIDs.join(', ')})`,
      },
      ({ new: message }) => {
        getApiClient()
          .findByID({
            id: message.id,
            collection: 'messages',
            depth: 4,
          })
          .catch((error) => {
            console.warn(`[Chat] Failed to fetch new message ID-${message.id}:`, error);
            return null;
          })
          .then((messageDoc) => {
            if (!messageDoc) return;
            const conversation = conversationMap.get(extractID(messageDoc.conversation));
            if (!conversation) return;
            addMessageToInfiniteCache(queryClient, messageDoc, conversation);
          });
      }
    );

    // Subscribe to channel if there are conversations
    if (conversationIDs.length > 0) {
      channel.subscribe((status) => {
        const isSubscribed = status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED;
        isSubscribedRef.current = isSubscribed;
      });
    }

    // Cleanup on unmount or conversation change
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      isSubscribedRef.current = false;
    };
  }, [channel, conversationMap, conversations, isSubscribed, queryClient]);
}
