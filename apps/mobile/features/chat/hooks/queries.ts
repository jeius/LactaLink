import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import { storeInfiniteDocuments } from '@/lib/localStorage/utils';
import { getMeUser } from '@/lib/stores/meUserStore';
import { Conversation, Message } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import isString from 'lodash/isString';
import { useEffect, useMemo } from 'react';
import { addConversationToCache } from '../lib/chatCacheUtils';
import {
  conversationsInfiniteOptions,
  createConversationQueryOptions,
  createInfiniteMessagesOptions,
} from '../lib/queryOptions';
import { getConversationStatus, transformToChatMessage } from '../lib/transformUtils';
import { ChatMessage } from '../lib/types';

export function useConversation(conversation: string | Conversation | undefined) {
  const { data, ...query } = useQuery(
    createConversationQueryOptions(extractID(conversation), isString(conversation))
  );

  return { ...query, data: extractCollection(conversation) || data };
}

export function useInfiniteMessages(conversation: Conversation) {
  const { data, ...query } = useInfiniteQuery(createInfiniteMessagesOptions(conversation));

  const dataArray = useMemo(() => {
    if (!data) return;
    const messages: Message[] = [];
    const chatMessages: ChatMessage[] = [];

    data.pages.forEach((page) => {
      page.docs.forEach((message) => {
        messages.push(message);
        chatMessages.push(transformToChatMessage(message));
      });
    });

    return { messages, chatMessages };
  }, [data]);

  return {
    ...query,
    data: dataArray?.messages,
    chatMessages: dataArray?.chatMessages,
    dataMap: data,
  };
}

export function useInfiniteConversations() {
  const queryClient = useQueryClient();
  const { data, ...query } = useInfiniteQuery(conversationsInfiniteOptions);

  const dataArray = useMemo(() => {
    if (!data) return;
    const allDocs: Conversation[] = [];
    data.pages.forEach((page) => {
      page.docs.forEach((doc) => {
        const { archived } = getConversationStatus(doc);
        if (archived) return;

        allDocs.push(doc);
        addConversationToCache(queryClient, doc);
      });
    });
    return allDocs;
  }, [data, queryClient]);

  useEffect(() => {
    const storageKey = createStorageKeyByUser(getMeUser(), QUERY_KEYS.CHATS.INFINITE.join('-'));
    if (data) storeInfiniteDocuments(data, storageKey);
  }, [data]);

  return { ...query, data: dataArray, dataMap: data };
}
