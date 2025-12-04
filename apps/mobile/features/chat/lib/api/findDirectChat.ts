import { getChatService } from '@/lib/services/chat';
import { getMeUser } from '@/lib/stores/meUserStore';
import { ConversationParticipant } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';

export function findDirectChat(
  participant: ConversationParticipant['participant'] | undefined | null
) {
  if (!participant) return Promise.resolve(null);

  const meUser = getMeUser();
  if (!meUser) throw new Error('User not logged in');

  const participantID = extractID(participant);
  const userID = extractID(meUser);

  const chatService = getChatService();
  return chatService.findDirectConversation([userID, participantID]);
}
