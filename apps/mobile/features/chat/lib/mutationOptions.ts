import { mutationOptions } from '@tanstack/react-query';
import { createDirectChat, createGroupChat } from './api/createChat';
import { addConversationToCache } from './chatCacheUtils';

export function createGroupChatCreationOptions() {
  return mutationOptions({
    mutationKey: ['create-group-chat'],
    mutationFn: createGroupChat,
    onSuccess: (data, _vars, _ctx, { client }) => {
      addConversationToCache(client, data);
    },
  });
}

export function createDirectChatCreationOptions() {
  return mutationOptions({
    mutationKey: ['create-direct-chat'],
    mutationFn: createDirectChat,
    onSuccess: (data, _vars, _ctx, { client }) => {
      addConversationToCache(client, data);
    },
  });
}
