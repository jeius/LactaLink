import { Conversation, Message } from '@lactalink/types/payload-generated-types';
import { mutationOptions } from '@tanstack/react-query';
import { sendMessage } from '../api/sendMessage';
import { addMessageToInfiniteCache } from '../chatCacheUtils';
import { createInfiniteMessagesOptions } from '../queryOptions';
import { transformToMessage } from '../transformUtils';

export function createSendMessageMutation(
  conversation: Conversation,
  onSuccess?: (msg: Message) => void
) {
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
    onSuccess: onSuccess,
    onSettled: (_data, _error, _vars, _ctx, { client }) => {
      // Invalidate messages to ensure fresh data
      client.invalidateQueries(infiniteMessagesOptions);
    },
  });
}
