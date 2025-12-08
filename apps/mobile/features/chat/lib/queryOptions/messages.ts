import { transformToInfiniteDataMap } from '@/lib/utils/transformToInfiniteData';
import { getApiClient } from '@lactalink/api';
import { Conversation, Message } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

export function createMessageQueryOptions(id: Message['id'] | undefined | null, enabled = true) {
  return queryOptions({
    enabled: !!id || enabled,
    queryKey: ['messages', id],
    queryFn: () => {
      if (!id) throw new Error('Message ID is undefined');
      const apiClient = getApiClient();
      return apiClient.findByID({
        collection: 'messages',
        id,
        depth: 5,
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function createInfiniteMessagesOptions(conversation: Conversation) {
  const conversationID = extractID(conversation);
  const initialMessages = conversation.messages;

  return infiniteQueryOptions({
    enabled: !!conversationID,
    initialPageParam: 1,
    queryKey: ['messages', 'infinite', conversationID],
    queryFn: async ({ pageParam }) => {
      if (!conversationID) throw new Error('Conversation ID is undefined');

      const apiClient = getApiClient();
      const { docs: messages, ...rest } = await apiClient.find({
        trash: true,
        collection: 'messages',
        where: { conversation: { equals: conversationID } },
        sort: '-createdAt',
        depth: 5,
        pagination: true,
        page: pageParam,
        limit: initialMessages?.docs?.length || 15,
        joins: {
          attachments: { count: true, limit: 0 },
          reads: { count: true, limit: 0 },
          reactions: { count: true, limit: 0 },
          replies: { count: true, limit: 0 },
        },
      });

      const docMap = new Map(messages.map((msg) => [msg.id, msg]));

      return { ...rest, docs: docMap };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prevData) => {
      if (!prevData) return transformToInfiniteDataMap(initialMessages);
      return prevData;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
  });
}
