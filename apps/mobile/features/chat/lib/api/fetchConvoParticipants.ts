import { getApiClient } from '@lactalink/api';
import { ConversationParticipant } from '@lactalink/types/payload-generated-types';

type ID = ConversationParticipant['id'];
type ReturnType<T> = T extends ID[] ? ConversationParticipant[] : ConversationParticipant;

export async function fetchConvoParticipants<T extends ID | ID[]>(
  id: T | undefined
): Promise<ReturnType<T>> {
  if (!id) throw new Error('ConversationParticipant ID(s) is undefined');
  const apiClient = getApiClient();

  if (Array.isArray(id)) {
    return apiClient.find({
      collection: 'conversation-participants',
      where: { id: { in: id } },
      depth: 5,
      pagination: false,
    }) as Promise<ReturnType<T>>;
  }

  return apiClient.findByID({
    collection: 'conversation-participants',
    id,
    depth: 5,
  }) as Promise<ReturnType<T>>;
}
