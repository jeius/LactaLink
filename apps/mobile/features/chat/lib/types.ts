import { ImageSchema } from '@lactalink/form-schemas';
import { UserProfile } from '@lactalink/types';
import { Conversation, ConversationParticipant } from '@lactalink/types/payload-generated-types';
import { IMessage } from 'react-native-gifted-chat';

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

export type ChatMessage = IMessage & {
  replyTo?: ChatMessage;
  media?: ImageSchema[];
  editedAt?: string | null;
  deletedAt?: string | null;
  conversation: string | Conversation;
  sender: UserProfile;
};
