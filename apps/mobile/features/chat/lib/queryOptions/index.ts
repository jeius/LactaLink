import { getApiClient } from '@lactalink/api';
import { ConversationParticipant, Message } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { queryOptions } from '@tanstack/react-query';
import { RNLatLng } from 'react-native-google-maps-plus';
import { fetchConvoParticipants } from '../api/fetchConvoParticipants';
import { findDirectChat } from '../api/findDirectChat';
import { findNearestUsers } from '../api/findNearestUsers';

export * from './conversationsInfiniteOptions';

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

export function createConvoParticipantQueryOptions(id: ConversationParticipant['id'] | undefined) {
  return queryOptions({
    enabled: !!id,
    queryKey: ['conversation-participants', id],
    queryFn: () => fetchConvoParticipants(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function createConvoParticipantsQueryOptions(
  ids: ConversationParticipant['id'][] | undefined,
  enabled = true
) {
  return queryOptions({
    enabled: !!ids || enabled,
    queryKey: ['conversation-participants', ids],
    queryFn: () => fetchConvoParticipants(ids),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function createNearestUsersQueryOptions(coordinates: RNLatLng | null) {
  return queryOptions({
    queryKey: ['users', 'nearest', coordinates],
    queryFn: () => findNearestUsers(coordinates),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 3,
  });
}

export function createFindDirectChatQueryOptions(
  participant: ConversationParticipant['participant'] | undefined | null,
  enabled = true
) {
  return queryOptions({
    enabled: !!participant || enabled,
    queryKey: ['conversations', 'direct', extractID(participant)],
    queryFn: () => findDirectChat(participant),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
