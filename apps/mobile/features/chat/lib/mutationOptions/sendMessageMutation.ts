import { Conversation } from '@lactalink/types/payload-generated-types';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { mutationOptions } from '@tanstack/react-query';
import { sendMessage } from '../api/sendMessage';
import { addMessageToInfiniteCache } from '../chatCacheUtils';
import { createInfiniteMessagesOptions } from '../queryOptions';
import { createChatChannel } from '../realtime/channels';
import { sendRealtimeMessage } from '../realtime/message';
import { transformToMessage } from '../transformUtils';

export function createSendMessageMutation(conversation: Conversation) {
  const infiniteMessagesOptions = createInfiniteMessagesOptions(conversation);
  return mutationOptions({
    mutationKey: ['send-message', conversation],
    mutationFn: sendMessage,
    onMutate: async (vars, { client }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await client.cancelQueries(infiniteMessagesOptions);

      // Snapshot previous messages
      const prevMessages = client.getQueryData(infiniteMessagesOptions.queryKey);

      const newMessage = transformToMessage(vars, prevMessages);

      // Optimistically update the messages cache
      addMessageToInfiniteCache(client, newMessage, conversation);
      return { prevMessages };
    },
    onError: (_err, _vars, ctx, { client }) => {
      // Rollback to previous messages on error
      if (ctx?.prevMessages) {
        client.setQueryData(infiniteMessagesOptions.queryKey, ctx.prevMessages);
      }
    },
    onSuccess: (data) => {
      const { channel, isSubscribed } = createChatChannel(conversation);

      const send = () => sendRealtimeMessage(channel, data);

      if (isSubscribed) {
        send();
      } else {
        channel.subscribe((status) => {
          if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) return;
          send();
        });
      }
    },
    onSettled: (_data, _error, _vars, _ctx, { client }) => {
      // Invalidate messages to ensure fresh data
      client.invalidateQueries(infiniteMessagesOptions);
    },
  });
}
