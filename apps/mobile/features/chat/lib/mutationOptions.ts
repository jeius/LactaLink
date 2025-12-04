import { mutationOptions } from '@tanstack/react-query';
import { createDirectChat, createGroupChat } from './api/createChat';
import { addConversationToCache } from './chatCacheUtils';
import { createFindDirectChatQueryOptions } from './queryOptions';

export function createGroupChatCreationOptions() {
  return mutationOptions({
    mutationKey: ['create-group-chat'],
    mutationFn: createGroupChat,
    onSuccess: (data, _vars, _ctx, { client }) => {
      addConversationToCache(client, data);
    },
  });
}

export function createDirectChatCreationMutation() {
  return mutationOptions({
    mutationKey: ['create-direct-chat'],
    mutationFn: createDirectChat,
    onSuccess: (data, participant, _ctx, { client }) => {
      addConversationToCache(client, data);

      // Cache the direct chat for the participant
      const queryOptions = createFindDirectChatQueryOptions(participant);
      client.setQueryData(queryOptions.queryKey, data);
    },
  });
}
