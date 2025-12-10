import { getChatService } from '@/lib/services/chat';
import { getMeUser } from '@/lib/stores/meUserStore';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { mutationOptions } from '@tanstack/react-query';
import { createDirectChat, createGroupChat } from '../api/createChat';
import { markAsRead } from '../api/markAsRead';
import { addConversationToAllCaches } from '../chatCacheUtils';
import { createFindDirectChatQueryOptions } from '../queryOptions';
import { updateMessageInConversation } from '../updateConversation';

export * from './sendMessageMutation';

export function createGroupChatCreationOptions() {
  return mutationOptions({
    mutationKey: ['create-group-chat'],
    mutationFn: createGroupChat,
    onSuccess: (data, _vars, _ctx, { client }) => {
      addConversationToAllCaches(client, data);
    },
  });
}

export function createDirectChatCreationMutation() {
  return mutationOptions({
    mutationKey: ['create-direct-chat'],
    mutationFn: createDirectChat,
    onSuccess: (data, participant, _ctx, { client }) => {
      addConversationToAllCaches(client, data);

      // Cache the direct chat for the participant
      const queryOptions = createFindDirectChatQueryOptions(participant);
      client.setQueryData(queryOptions.queryKey, data);
    },
  });
}

export function createMarkAsReadMutation(conversation: Conversation) {
  return mutationOptions({
    mutationKey: ['mark-as-read', 'messages', conversation],
    mutationFn: markAsRead,
    onSuccess: (data, _vars, _ctx, { client }) => {
      data
        .filter((m) => !!m)
        .map((msg) => {
          const updatedConversation = updateMessageInConversation(conversation, msg);
          addConversationToAllCaches(client, updatedConversation);
        });
    },
  });
}

export function createDeleteConversationMutation(conversation: Conversation) {
  return mutationOptions({
    mutationKey: ['delete', 'conversation', conversation.id],
    mutationFn: () => getChatService().archiveConversation(conversation, getMeUser()!),
    onSuccess: (data, _vars, _ctx, { client }) => {
      addConversationToAllCaches(client, data);
    },
  });
}
