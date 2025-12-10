import { getChatService } from '@/lib/services/chat';
import { getMeUser } from '@/lib/stores/meUserStore';
import { CreateGroupChatData } from '@lactalink/api/services';
import type {
  Conversation,
  ConversationParticipant,
  User,
} from '@lactalink/types/payload-generated-types';

/**
 * Get the current user
 */
function getCurrentUser(): User {
  const meUser = getMeUser();
  if (!meUser) throw new Error('User not logged in');
  return meUser;
}

/**
 * Creates a group chat with multiple participants
 */
export async function createGroupChat(data: CreateGroupChatData): Promise<Conversation> {
  const meUser = getCurrentUser();
  return getChatService().createGroupChat(data, meUser);
}

/**
 * Creates a direct chat between two users
 */
export async function createDirectChat(
  participant: ConversationParticipant['participant']
): Promise<Conversation> {
  const meUser = getCurrentUser();
  return getChatService().createDirectChat(participant, meUser);
}
