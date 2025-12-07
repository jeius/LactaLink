import { getMeUser } from '@/lib/stores/meUserStore';
import { CONVERSATION_TYPE } from '@lactalink/enums';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

export function getOtherUserFromDirectChat(conversation: Conversation) {
  if (conversation.type !== CONVERSATION_TYPE.DIRECT.value) {
    throw new Error('Conversation is not a direct chat');
  }
  const participants = extractCollection(conversation.participants?.docs) || [];
  if (participants.length !== 2) {
    throw new Error('Direct chat must have exactly two participants');
  }

  const meUser = getMeUser();
  if (!meUser) throw new Error('User is unauthenticated');

  const otherParticipant = participants.find((p) => extractID(p.participant) !== meUser.id);

  if (!otherParticipant) {
    throw new Error('Other participant not found in direct chat');
  }

  const otherUser = extractCollection(otherParticipant.participant);

  if (!otherUser) {
    throw new Error('Other participant user data is not populated');
  }

  return otherUser;
}
