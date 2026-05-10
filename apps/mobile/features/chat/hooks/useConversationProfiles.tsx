import { useMultipleUserProfiles, useUserProfile } from '@/features/profile/hooks/useProfileData';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { getOtherUserFromDirectChat } from '../lib/getOtherUserFromDirectChat';

export function useParticipantsProfiles(conversation: Conversation) {
  const participants = extractCollection(conversation.participants?.docs) || [];
  const users = participants.map((p) => p.participant);
  return useMultipleUserProfiles(users);
}

export function useOtherUserProfile(conversation: Conversation) {
  const otherUser = getOtherUserFromDirectChat(conversation);
  return useUserProfile(otherUser);
}
