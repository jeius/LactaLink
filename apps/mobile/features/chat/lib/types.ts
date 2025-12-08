import { ImageSchema } from '@lactalink/form-schemas';
import { UserProfile } from '@lactalink/types';
import { Conversation, ConversationParticipant } from '@lactalink/types/payload-generated-types';
import { LucideIcon } from 'lucide-react-native';
import { type IMessage } from 'react-native-gifted-chat';

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
  media?: ImageSchema[];
  editedAt?: string | null;
  deletedAt?: string | null;
  conversation: string | Conversation;
  sender: UserProfile;
};

export type CreateChatMessage = Pick<IMessage, 'user'> & Pick<ChatMessage, 'media'>;

export type ChatActionType = { icon: LucideIcon; action: () => void };
