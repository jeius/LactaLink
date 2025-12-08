import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { DBMessage } from '@lactalink/types/database';
import { Conversation, Message } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { REALTIME_SUBSCRIBE_STATES, RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { addMessageToInfiniteCache } from '../../lib/chatCacheUtils';
import { createChatChannel } from '../../lib/realtime/channels';

type TypingTracker = {
  user_id: string;
  typing: boolean;
};

export function useConversationChannel(conversation: Conversation) {
  const queryClient = useQueryClient();

  const isSubscribedRef = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [newMessage, setNewMessage] = useState<Message | null>(null);

  const { typingMap } = useMemo(() => {
    const participants = extractCollection(extractCollection(conversation)?.participants?.docs);
    const map = new Map(participants?.map((p) => [extractID(p.participant), false]) || []);
    return { participants, typingMap: map };
  }, [conversation]);

  const [typingUsersMap, setTypingUsersMap] = useState(typingMap);

  // Update typing map when conversation changes
  useEffect(() => {
    setTypingUsersMap(typingMap);
  }, [typingMap]);

  // Typing indicator function
  const typing = useCallback((isTyping: boolean) => {
    if (!isSubscribedRef.current || !channelRef.current) return;

    const meUser = getMeUser();
    if (!meUser) return;

    channelRef.current.track({ user_id: meUser.id, typing: isTyping } as TypingTracker);
  }, []);

  // Unsubscribe function
  const unsubscribe = useCallback(() => {
    if (!isSubscribedRef.current || !channelRef.current) return;

    channelRef.current.unsubscribe();
    channelRef.current = null;
    isSubscribedRef.current = false;
    setNewMessage(null);
  }, []);

  // Setup channel subscription
  useEffect(() => {
    const conversationId = extractID(conversation);

    // Cleanup previous channel if conversation changed
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    const channel = createChatChannel(conversationId);
    channelRef.current = channel;

    // Presence tracking for typing indicators
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<TypingTracker>();

      const newTypingMap = new Map(typingMap);
      Object.values(state).forEach((presences) => {
        presences.forEach((presence) => {
          if (presence.user_id !== extractID(getMeUser())) {
            newTypingMap.set(presence.user_id, presence.typing);
          }
        });
      });

      setTypingUsersMap(newTypingMap);
    });

    // Listen for new messages
    channel.on<DBMessage>(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
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

            setNewMessage(messageDoc);

            // Avoid duplicating own messages
            if (isEqualProfiles(messageDoc.sender, getMeUser()?.profile)) return;
            addMessageToInfiniteCache(queryClient, messageDoc, conversation);
          });
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
  }, [conversation, queryClient, typingMap]);

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

  // Handle keyboard show/hide for typing indicators
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => typing(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => typing(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [typing]);

  return {
    newMessage,
    typingUsers: Array.from(typingUsersMap.entries())
      .filter(([_, isTyping]) => isTyping)
      .map(([userId]) => userId),
    unsubscribe,
  };
}
