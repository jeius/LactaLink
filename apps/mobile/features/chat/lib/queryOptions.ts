import { getApiClient } from '@lactalink/api';
import { ConversationParticipant, Message } from '@lactalink/types/payload-generated-types';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { RNLatLng } from 'react-native-google-maps-plus';
import { findNearestUsers } from './findNearestUsers';

export const conversationsInfiniteOptions = infiniteQueryOptions({
  initialPageParam: 1,
  queryKey: ['conversations'],
  queryFn: async ({ pageParam }) => {
    const apiClient = getApiClient();
    const { docs, ...conversations } = await apiClient.find({
      collection: 'conversations',
      pagination: true,
      page: pageParam,
      limit: 15,
      depth: 5,
      sort: '-lastMessageAt',
    });
    return { ...conversations, docs: new Map(docs.map((d) => [d.id, d])) };
  },
  getNextPageParam: (page) => page.nextPage,
  getPreviousPageParam: (page) => page.prevPage,
});

export function createMessageQueryOptions(id: Message['id'] | undefined, enabled = true) {
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

export function createConvoParticipantQueryOptions(id: ConversationParticipant['id'] | undefined) {
  return queryOptions({
    enabled: !!id,
    queryKey: ['conversation-participants', id],
    queryFn: () => {
      if (!id) throw new Error('Message ID is undefined');
      const apiClient = getApiClient();
      return apiClient.findByID({
        collection: 'conversation-participants',
        id,
        depth: 5,
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export const createNearestUsersQueryOptions = (coordinates: RNLatLng | null) =>
  queryOptions({
    queryKey: ['users', 'nearest', coordinates],
    queryFn: () => findNearestUsers(coordinates),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 3, // 3 minutes
  });
