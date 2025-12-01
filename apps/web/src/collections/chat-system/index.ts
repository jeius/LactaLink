import { CollectionConfig } from 'payload';
import ConversationParticipants from './ConversationParticipants';
import Conversations from './Conversations';
import MessageAttachments from './MessageAttachments';
import MessageReactions from './MessageReactions';
import MessageReads from './MessageReads';
import Messages from './Messages';
import MutedConversations from './MutedConversations';

export const ChatSystemCollections: CollectionConfig[] = [
  Messages,
  Conversations,
  MessageAttachments,
  MessageReactions,
  ConversationParticipants,
  MutedConversations,
  MessageReads,
];

export default ChatSystemCollections;
