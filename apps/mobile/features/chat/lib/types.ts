import { ImageSchema } from '@lactalink/form-schemas';
import { ImageData, UserProfile } from '@lactalink/types';
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

export type ChatMessage = Omit<IMessage, '_id'> & {
  _id: string;
  media?: ImageSchema[];
  editedAt?: string | null;
  deletedAt?: string | null;
  conversation: string | Conversation;
  sender: UserProfile;
  replyTo?: (Pick<IMessage, '_id' | 'text'> & { media?: ImageData | null }) | null;
};

export type CreateChatMessage = Pick<ChatMessage, 'media'>;

export type ChatActionType = { icon: LucideIcon; action: () => void };
