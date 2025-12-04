import { UserProfile } from '@lactalink/types';
import { ConversationParticipant } from '@lactalink/types/payload-generated-types';

export type CreateConvoSearchParams = {
  type?: 'direct' | 'group';
};

export type CreateGroupChatData = {
  name: string;
  participants: UserProfile[];
};

export interface ParticipantConfig {
  userId: string;
  role?: ConversationParticipant['role'];
}
