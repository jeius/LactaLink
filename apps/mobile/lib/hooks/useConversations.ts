import { useAuth } from '@/hooks/auth/useAuth';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch conversations list
 */
export function useConversations() {
  const { token } = useAuth();

  return useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: ({ pageParam = 1 }) =>
      getConversations({
        page: pageParam,
        limit: 20,
        token,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage : undefined),
    enabled: !!token,
  });
}

/**
 * Hook to find or create a direct conversation
 */
export function useFindOrCreateDirectConversation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantId: string) => findOrCreateDirectConversation({ participantId, token }),
    onSuccess: (conversation) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Cache the new conversation
      queryClient.setQueryData(['conversation', conversation.id], conversation);
    },
  });
}

/**
 * Hook to fetch messages for a conversation
 */
export function useMessages(conversationId: string) {
  const { token } = useAuth();

  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam = 1 }) =>
      getMessages({
        conversationId,
        page: pageParam,
        limit: 50,
        token,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPage : undefined),
    enabled: !!conversationId && !!token,
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      conversationId: string;
      content: string;
      replyToId?: string;
      mentions?: string[];
    }) =>
      sendMessage({
        ...params,
        token,
      }),
    onSuccess: (message, variables) => {
      // Optimistically update messages list
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.conversationId],
      });
      // Update conversation's lastMessage
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * Hook to mark message as read
 */
export function useMarkAsRead() {
  const { token } = useAuth();

  return useMutation({
    mutationFn: (messageId: string) =>
      markMessageAsRead({
        messageId,
        token,
      }),
  });
}
