import { CollectionConfig } from 'payload';
import ConversationParticipants from './ConversationParticipants';
import Conversations from './Conversations';
import ConversationStatus from './ConversationStatus';
import MessageAttachments from './MessageAttachments';
import MessageReactions from './MessageReactions';
import MessageReads from './MessageReads';
import Messages from './Messages';

export const ChatSystemCollections: CollectionConfig[] = [
  Messages,
  Conversations,
  MessageAttachments,
  MessageReactions,
  ConversationParticipants,
  ConversationStatus,
  MessageReads,
];

export default ChatSystemCollections;
