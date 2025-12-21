import { getMeUser } from '@/lib/stores/meUserStore';
import { supabase } from '@/lib/supabase';
import { Conversation, Message, User } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { REALTIME_SUBSCRIBE_STATES, RealtimeChannel } from '@supabase/supabase-js';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { createStore, StoreApi, useStore } from 'zustand';
import { addMessageToInfiniteCache } from '../../lib/chatCacheUtils';

type TypingTracker = {
  userID: string;
  typing: boolean;
};

interface ChatProviderProps {
  conversation: Conversation;
}

interface ChatStore {
  typingUsers: User[];
  newMessage: Message | null;
  channel: RealtimeChannel | null;
  actions: {
    typing: (isTyping: boolean) => void;
    sendMessage: (msg: Message) => void;
  };
  subscription: {
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
  };
}

const MESSAGE_EVENT = 'new-message';
const SUBSCRIBED = REALTIME_SUBSCRIBE_STATES.SUBSCRIBED;
const ChatContext = createContext<StoreApi<ChatStore> | null>(null);

export const useTypingUsers = () => useChatStore((state) => state.typingUsers);
export const useNewMessage = () => useChatStore((state) => state.newMessage);
export const useChatActions = () => useChatStore((state) => state.actions);

export default function ChatProvider({
  children,
  conversation,
}: PropsWithChildren<ChatProviderProps>) {
  const queryClient = useQueryClient();
  const [store] = useState(create(conversation, queryClient));

  // Setup subscription on mount/unmount
  useEffect(() => {
    // Subscribe to channel
    store.getState().subscription.subscribe();

    return () => {
      // Unsubscribe from channel
      store.getState().subscription.unsubscribe();
    };
  }, [store]);

  // Handle keyboard show/hide for typing indicators
  useEffect(() => {
    const typing = store.getState().actions.typing;
    const showSub = Keyboard.addListener('keyboardDidShow', () => typing(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => typing(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [store]);

  return <ChatContext.Provider value={store}>{children}</ChatContext.Provider>;
}

//#region Hooks/Helpers
function useChatStore<T>(selector: (state: ChatStore) => T) {
  const store = useContext(ChatContext);
  if (!store) {
    throw new Error('useChatStore must be used within a ChatContext provider');
  }
  return useStore(store, selector);
}

function create(conversation: Conversation, queryClient: QueryClient) {
  const participants = extractCollection(extractCollection(conversation)?.participants?.docs);

  const typingMap = new Map<string, boolean>();
  const participantsMap = new Map<string, User | null>();

  participants?.forEach((p) => {
    participantsMap.set(extractID(p.participant), extractCollection(p.participant));
    typingMap.set(extractID(p.participant), false);
  });

  return createStore<ChatStore>((set, get) => ({
    typingUsers: [],
    newMessage: null,
    channel: null,
    actions: {
      typing: (isTyping) => {
        const channel = get().channel;
        const meUser = getMeUser();
        if (!meUser || !channel) return;
        // Track typing status
        channel.track({ userID: meUser.id, typing: isTyping } as TypingTracker);
      },
      sendMessage: (msg) => {
        const channel = get().channel;
        if (!channel) return;
        // Send a broadcast message
        channel.send({ type: 'broadcast', event: MESSAGE_EVENT, payload: msg });
      },
    },
    subscription: {
      subscribe: async () => {
        if (get().channel) return; // Already subscribed

        const channel = supabase.channel(`chat:${conversation.id}`);

        // Presence tracking for typing indicators
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState<TypingTracker>();

          const typingUsers = new Set<User>();

          Object.values(state).forEach((presences) => {
            presences.forEach(({ userID, typing }) => {
              // Exclude self from typing users
              if (userID === getMeUser()?.id) return;
              // Get user info
              const user = participantsMap.get(userID);
              // Add to set if typing
              if (user && typing) typingUsers.add(user);
            });
          });

          set({ typingUsers: Array.from(typingUsers) });
        });

        // Message receiving
        channel.on<Message>('broadcast', { event: MESSAGE_EVENT }, ({ payload }) => {
          set({ newMessage: payload });
          // Avoid duplicating own messages
          if (isEqualProfiles(payload.sender, getMeUser()?.profile)) return;
          addMessageToInfiniteCache(queryClient, payload, conversation);
        });

        console.log('Subscribing to chat channel', extractID(conversation));

        channel.subscribe((status) => {
          console.log('Subscription status for chat channel', extractID(conversation), status);
          if (status === SUBSCRIBED) {
            set({ channel });
          } else if (status !== REALTIME_SUBSCRIBE_STATES.CLOSED) {
            console.error('Failed to subscribe to channel: ' + status);
          }
        });
      },
      unsubscribe: async () => {
        const channel = get().channel;
        // Already unsubscribed
        if (!channel) return;
        // Unsubscribe from channel
        const res = await supabase.removeChannel(channel);
        if (res !== 'ok') {
          console.error('Failed to unsubscribe from channel: ' + res);
        }
        // Clear channel from store
        set({ channel: null, typingUsers: [] });
        console.log('Unsubscribed from chat channel', extractID(conversation));
      },
    },
  }));
}
//#endregion
