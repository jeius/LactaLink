import { IApiClient } from '@/interfaces/ApiClient';
import { CONVERSATION_TYPE, MESSAGE_TYPE } from '@lactalink/enums';
import { FindDirectConversationParams } from '@lactalink/form-schemas/validators';
import { UserProfile } from '@lactalink/types';
import { ApiFetchResponse } from '@lactalink/types/api';
import {
  Conversation,
  ConversationParticipant,
  Message,
  MessageAttachment,
  User,
} from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { CreateConvoParticipantError, SendMessageError } from './errors';
import {
  ADMIN_ROLE,
  cleanupConversation,
  createConversation,
  CreateGroupChatData,
  createParticipants,
  extractParticipantIds,
  MEMBER_ROLE,
  ParticipantConfig,
} from './helpers';

type Participant = ConversationParticipant['participant'];

type SendMessageArgs = {
  conversation: string | Conversation;
  sender: UserProfile;
  content: string;
  attachments?: MessageAttachment['attachment'][];
  replyTo?: string;
};

class ChatService {
  constructor(private apiClient: IApiClient) {}

  /**
   * Creates a group chat with multiple participants
   */
  createGroupChat = async (data: CreateGroupChatData, createdBy: User): Promise<Conversation> => {
    const participantIds = extractParticipantIds(data.participants);

    const conversation = await createConversation(
      {
        type: CONVERSATION_TYPE.GROUP.value,
        title: data.name.length > 0 ? data.name : undefined,
        createdBy: createdBy.id,
      },
      this.apiClient
    );

    // No need to create for the creator, they are auto-added as admin
    const participantConfigs = participantIds.map(
      (userId): ParticipantConfig => ({ userId, role: MEMBER_ROLE })
    );

    try {
      await createParticipants(conversation.id, participantConfigs, this.apiClient);
      // Fetch fresh conversation with participants
      return this._fetchConversation(conversation.id);
    } catch (error) {
      if (error instanceof CreateConvoParticipantError) {
        await cleanupConversation(conversation.id, error.data, this.apiClient);
      }
      throw error;
    }
  };

  /**
   * Creates a direct chat between two users
   */
  createDirectChat = async (
    participant: ConversationParticipant['participant'],
    createdBy: User
  ): Promise<Conversation> => {
    const participantId = extractID(participant);

    if (!participantId) {
      throw new Error('Invalid participant ID');
    }

    const existingConversation = await this.findDirectConversation([participant, createdBy]);

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = await createConversation(
      {
        type: CONVERSATION_TYPE.DIRECT.value,
        createdBy: createdBy.id,
      },
      this.apiClient
    );

    // No need to create for the creator, they are auto-added as admin
    // Participants in a direct chat are always admins
    const participantConfigs: ParticipantConfig[] = [{ userId: participantId, role: ADMIN_ROLE }];

    try {
      await createParticipants(conversation.id, participantConfigs, this.apiClient);
      // Fetch fresh conversation with participants
      return this._fetchConversation(conversation.id);
    } catch (error) {
      if (error instanceof CreateConvoParticipantError) {
        await cleanupConversation(conversation.id, error.data, this.apiClient);
      }
      throw error;
    }
  };

  findDirectConversation = async (participants: [Participant, Participant]) => {
    const params = extractID(participants) as FindDirectConversationParams;

    const res = await this.apiClient.fetch<ApiFetchResponse<Conversation | null>>(
      '/api/conversations/direct',
      {
        method: 'GET',
        searchParams: { participants: params },
      }
    );

    if ('error' in res) {
      throw new Error(`Failed to find direct conversation: ${res.message}`);
    }

    return res.data;
  };

  sendMessage = async (
    { content, conversation, sender, attachments, replyTo }: SendMessageArgs,
    createdBy: User
  ): Promise<Message> => {
    const message = await this.apiClient.create({
      collection: 'messages',
      data: {
        type: MESSAGE_TYPE.TEXT.value,
        conversation: extractID(conversation),
        sender: { relationTo: sender.relationTo, value: extractID(sender.value) },
        content: content,
        replyTo: replyTo,
      },
    });

    const successfullAttachments: MessageAttachment[] = [];

    if (attachments && attachments.length > 0) {
      const attachmentPromises = attachments.map(async (attachment) => {
        const attachmentDoc = await this.apiClient.create({
          collection: 'message-attachments',
          data: {
            message: message.id,
            attachment: { relationTo: attachment.relationTo, value: extractID(attachment.value) },
            createdBy: createdBy.id,
          },
        });
        successfullAttachments.push(attachmentDoc);
        return attachmentDoc;
      });

      await Promise.all(attachmentPromises).catch((err) => {
        throw new SendMessageError(
          'Failed to create message attachment(s): ' + extractErrorMessage(err),
          { attachments: successfullAttachments, message }
        );
      });
    }

    return {
      ...message,
      attachments: {
        docs: successfullAttachments,
        hasNextPage: false,
        totalDocs: successfullAttachments.length,
      },
    };
  };

  isMessageRead = async (message: string | Message, user: User) => {
    const userProfile = user.profile;
    if (!userProfile) throw new Error('User does not have a profile. Please setup your account.');

    // Check if a read record exists, exclude own messages.
    const { totalDocs } = await this.apiClient.count({
      collection: 'message-reads',
      where: {
        and: [
          { message: { equals: extractID(message) } },
          { user: { equals: extractID(user) } },
          { 'message.sender.value': { not_equals: extractID(userProfile.value) } },
        ],
      },
    });
    return totalDocs > 0;
  };

  markMessageAsRead = async (message: Message, user: User): Promise<Message | null> => {
    // Check if already read
    const alreadyRead = await this.isMessageRead(message, user);
    if (alreadyRead) return null;

    const read = await this.apiClient.create({
      collection: 'message-reads',
      data: {
        message: extractID(message),
        user: extractID(user),
        readAt: new Date().toISOString(),
      },
    });

    const readDocs = message?.reads?.docs ?? [];
    readDocs.push(read);

    const hasNextPage = message?.reads?.hasNextPage;

    return { ...message, reads: { docs: readDocs, totalDocs: readDocs.length, hasNextPage } };
  };

  archiveConversation = async (
    conversation: Conversation,
    user: User | null
  ): Promise<Conversation> => {
    if (!user) throw new Error('User not logged in');

    const statusDoc = await this.apiClient.create({
      collection: 'conversation-statuses',
      data: {
        conversation: extractID(conversation),
        archived: true,
        user: extractID(user),
      },
    });

    const archivedStatuses = conversation.archivedStatuses?.docs || [];
    archivedStatuses.push(statusDoc);
    const hasNextPage = conversation.archivedStatuses?.hasNextPage;

    return {
      ...conversation,
      archivedStatuses: { docs: archivedStatuses, totalDocs: archivedStatuses.length, hasNextPage },
    };
  };

  private _fetchConversation = async (id: string): Promise<Conversation> => {
    return this.apiClient.findByID({
      collection: 'conversations',
      id: id,
      depth: 5,
      joins: {
        archivedStatuses: { count: true, limit: 0 },
        mutedStatuses: { count: true, limit: 0 },
        participants: { count: true, limit: 0 },
        messages: { count: true, limit: 10 },
      },
    });
  };
}

export { ChatService, CreateConvoParticipantError, SendMessageError };
export type { CreateGroupChatData, SendMessageArgs };
