import { MESSAGE_TYPE } from '@lactalink/enums';
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
import { IApiClient } from 'src/interfaces/ApiClient';

type Participant = ConversationParticipant['participant'];

type SendMessageArgs = {
  conversation: string | Conversation;
  sender: UserProfile;
  content: string;
  attachments?: MessageAttachment['attachment'][];
};

export class SendMessageError extends Error {
  constructor(
    message: string,
    public data: { attachments?: MessageAttachment[]; message?: Message }
  ) {
    super(message);
    this.name = 'SendMessageError';
  }
}

export class ChatService {
  constructor(private apiClient: IApiClient) {}

  async findDirectConversation(participants: [Participant, Participant]) {
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
  }

  async sendMessage({
    content,
    conversation,
    sender,
    attachments,
  }: SendMessageArgs): Promise<Message> {
    const message = await this.apiClient.create({
      collection: 'messages',
      data: {
        type: MESSAGE_TYPE.TEXT.value,
        conversation: extractID(conversation),
        sender: { relationTo: sender.relationTo, value: extractID(sender.value) },
        content: content,
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
            createdBy: '', // Will automatically be set by the backend hook
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
  }

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
          { 'message.sender.relationTo': { not_equals: userProfile.relationTo } },
          { 'message.sender.value': { not_equals: extractID(userProfile.value) } },
        ],
      },
    });
    return totalDocs > 0;
  };

  markMessageAsRead = async (message: Message, user: User): Promise<Message> => {
    // Check if already read
    const alreadyRead = await this.isMessageRead(message, user);
    if (alreadyRead) return message;

    const read = await this.apiClient.create({
      collection: 'message-reads',
      data: {
        message: extractID(message),
        user: extractID(user),
        readAt: new Date().toISOString(),
      },
    });

    const readDocs = message.reads ? (message.reads.docs ?? []) : [];
    readDocs.push(read);

    const totalReads = message.reads ? (message.reads.totalDocs ?? 0) + 1 : 1;
    const hasNextPage = message.reads ? message.reads.hasNextPage : false;

    return { ...message, reads: { docs: readDocs, totalDocs: totalReads, hasNextPage } };
  };
}
