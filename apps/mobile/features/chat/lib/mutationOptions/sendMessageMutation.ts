import { Conversation } from '@lactalink/types/payload-generated-types';
import { mutationOptions } from '@tanstack/react-query';
import { produce } from 'immer';
import { sendMessage } from '../api/sendMessage';
import { addConversationToCache, addMessageToCache } from '../chatCacheUtils';
import { createInfiniteMessagesOptions } from '../queryOptions';
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

      const newMessage = transformToMessage(vars);

      // Optimistically update the messages cache
      client.setQueryData(infiniteMessagesOptions.queryKey, (oldData) =>
        addMessageToCache(oldData, newMessage)
      );

      const updatedConversation = produce(conversation, (draft) => {
        draft.lastMessageAt = newMessage.createdAt;

        if (!draft.messages) {
          draft.messages = { docs: [newMessage], totalDocs: 1, hasNextPage: false };
          return;
        }

        const totalDocs = draft.messages.totalDocs || 0;
        const docs = draft.messages.docs || [];
        draft.messages = {
          docs: [newMessage, ...docs],
          totalDocs: totalDocs + 1,
        };
      });

      addConversationToCache(client, updatedConversation);
      return { prevMessages };
    },
    onError: (_err, _vars, ctx, { client }) => {
      // Rollback to previous messages on error
      if (ctx?.prevMessages) {
        client.setQueryData(infiniteMessagesOptions.queryKey, ctx.prevMessages);
      }
    },
    onSettled: (_data, _error, _vars, _ctx, { client }) => {
      // Invalidate messages to ensure fresh data
      client.invalidateQueries(infiniteMessagesOptions);
    },
  });
}
