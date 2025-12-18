import { getMeUser } from '@/lib/stores/meUserStore';
import { supabase } from '@/lib/supabase';
import { Conversation, Message, User } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { REALTIME_SUBSCRIBE_STATES, RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { addMessageToInfiniteCache } from '../../lib/chatCacheUtils';
import { createChatChannel } from '../../lib/realtime/channels';
import { receiveRealtimeMessage } from '../../lib/realtime/message';

type TypingTracker = {
  user_id: string;
  typing: boolean;
};

export function useConversationChannel(conversation: Conversation) {
  const queryClient = useQueryClient();

  const { channel, isSubscribed } = useMemo(() => createChatChannel(conversation), [conversation]);

  const isSubscribedRef = useRef(isSubscribed);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [newMessage, setNewMessage] = useState<Message | null>(null);

  const { typingMap, participantsMap } = useMemo(() => {
    const participants = extractCollection(extractCollection(conversation)?.participants?.docs);

    const typingMap = new Map<string, boolean>();
    const participantsMap = new Map<string, User | null>();

    participants?.forEach((p) => {
      participantsMap.set(extractID(p.participant), extractCollection(p.participant));
      typingMap.set(extractID(p.participant), false);
    });

    return { participants, typingMap, participantsMap };
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
    // Cleanup previous channel if conversation changed
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    channelRef.current = channel;
    isSubscribedRef.current = isSubscribed;

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

    receiveRealtimeMessage(channel, (newMessage) => {
      setNewMessage(newMessage);
      // Avoid duplicating own messages
      if (isEqualProfiles(newMessage.sender, getMeUser()?.profile)) return;
      addMessageToInfiniteCache(queryClient, newMessage, conversation);
    });

    // Subscribe to channel
    channel.subscribe((status) => {
      const isSubscribed = status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED;
      isSubscribedRef.current = isSubscribed;
    });

    // Cleanup on unmount or conversation change
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      isSubscribedRef.current = false;
    };
  }, [channel, conversation, isSubscribed, queryClient, typingMap]);

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
          supabase.removeChannel(channelRef.current);
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
      .map(([userId]) => participantsMap.get(userId))
      .filter(Boolean) as User[],
    unsubscribe,
  };
}
