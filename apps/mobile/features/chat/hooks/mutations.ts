import { Conversation } from '@lactalink/types/payload-generated-types';
import { useMutation } from '@tanstack/react-query';
import { useChatActions } from '../components/context';
import {
  createDeleteConversationMutation,
  createDirectChatCreationMutation,
  createGroupChatCreationOptions,
  createMarkAsReadMutation,
  createSendMessageMutation,
} from '../lib/mutationOptions';

export function useDeleteConversation(conversation: Conversation) {
  return useMutation(createDeleteConversationMutation(conversation));
}

export function useMarkReadConversation(conversation: Conversation) {
  return useMutation(createMarkAsReadMutation(conversation));
}

export function useCreateDirectChat() {
  return useMutation(createDirectChatCreationMutation());
}

export function useCreateGroupChat() {
  return useMutation(createGroupChatCreationOptions());
}

export function useSendMessage(conversation: Conversation) {
  const { sendMessage } = useChatActions();
  return useMutation(createSendMessageMutation(conversation, sendMessage));
}
