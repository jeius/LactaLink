import { QUERY_KEYS } from '@/lib/constants';
import { getStoredInfiniteDocuments } from '@/lib/localStorage/utils';
import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

const BASE_KEY = QUERY_KEYS.CHATS.INFINITE.join('-');

export const conversationsInfiniteOptions = infiniteQueryOptions({
  initialPageParam: 1,
  queryKey: QUERY_KEYS.CHATS.INFINITE,
  queryFn: async ({ pageParam, client }) => {
    const apiClient = getApiClient();
    const { docs, ...conversations } = await apiClient.find({
      collection: 'conversations',
      pagination: true,
      page: pageParam,
      limit: 15,
      depth: 5,
      sort: '-lastMessageAt',
      joins: {
        messages: { limit: 15, sort: '-createdAt', count: true },
      },
    });

    const docMap = new Map<string, Conversation>();

    docs.forEach((doc) => {
      docMap.set(doc.id, doc);
      const queryKey = createConversationQueryOptions(doc.id).queryKey;
      client.setQueryData(queryKey, doc);
    });

    return { ...conversations, docs: docMap };
  },
  getNextPageParam: (page) => page.nextPage,
  getPreviousPageParam: (page) => page.prevPage,
  placeholderData: (prevData) => {
    const storageKey = createStorageKeyByUser(getMeUser(), BASE_KEY);
    if (!prevData) return getStoredInfiniteDocuments(storageKey);
    return prevData;
  },
});

export function createConversationQueryOptions(id: string | null | undefined, enabled = true) {
  return queryOptions({
    enabled: !!id || enabled,
    queryKey: [...QUERY_KEYS.CHATS.ONE, id],
    queryFn: () => {
      if (!id) throw new Error('Conversation ID is required');
      const apiClient = getApiClient();
      return apiClient.findByID({
        collection: 'conversations',
        id,
        depth: 5,
      });
    },
  });
}
