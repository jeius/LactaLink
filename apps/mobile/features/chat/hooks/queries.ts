import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import { storeInfiniteDocuments } from '@/lib/localStorage/utils';
import { getMeUser } from '@/lib/stores/meUserStore';
import {
  Conversation,
  ConversationParticipant,
  Message,
} from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { areStrings } from '@lactalink/utilities/type-guards';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import isString from 'lodash/isString';
import { useEffect } from 'react';
import {
  conversationsInfiniteOptions,
  createConversationQueryOptions,
  createConvoParticipantsQueryOptions,
  createInfiniteMessagesOptions,
  createMessageQueryOptions,
} from '../lib/queryOptions';

export function useMessage(message: string | Message | undefined | null) {
  const { data, ...query } = useQuery(
    createMessageQueryOptions(extractID(message), isString(message))
  );

  return { ...query, data: message === null ? null : extractCollection(message) || data };
}

export function useConversation(conversation: string | Conversation | undefined) {
  const { data, ...query } = useQuery(
    createConversationQueryOptions(extractID(conversation), isString(conversation))
  );

  return { ...query, data: extractCollection(conversation) || data };
}

export function useConvoParticipantsQuery(
  participants: (string | ConversationParticipant)[] | undefined
) {
  const participantIds = (participants || []).map((p) => extractID(p));
  const queryOptions = createConvoParticipantsQueryOptions(
    participantIds,
    areStrings(participants || [])
  );

  const { data, ...query } = useQuery(queryOptions);

  return { ...query, data: extractCollection(participants) || data };
}

export function useInfiniteMessages(conversation: Conversation | undefined) {
  const infiniteQuery = useInfiniteQuery(createInfiniteMessagesOptions(conversation));
  return infiniteQuery;
}

export function useInfiniteConversations() {
  const { data, ...query } = useInfiniteQuery(conversationsInfiniteOptions);

  useEffect(() => {
    const storageKey = createStorageKeyByUser(getMeUser(), QUERY_KEYS.CHATS.INFINITE.join('-'));
    if (data) storeInfiniteDocuments(data, storageKey);
  }, [data]);

  return { ...query, data };
}
