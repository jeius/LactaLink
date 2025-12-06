import { MESSAGE_TYPE } from '@lactalink/enums';
import { FindDirectConversationParams } from '@lactalink/form-schemas/validators';
import { UserProfile } from '@lactalink/types';
import { ApiFetchResponse } from '@lactalink/types/api';
import {
  Conversation,
  ConversationParticipant,
  Message,
  User,
} from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { IApiClient } from 'src/interfaces/ApiClient';

type Participant = ConversationParticipant['participant'];

type SendMessageArgs = {
  conversation: string | Conversation;
  sender: UserProfile;
  content: string;
};

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

  async sendMessage({ content, conversation, sender }: SendMessageArgs) {
    return this.apiClient.create({
      collection: 'messages',
      data: {
        type: MESSAGE_TYPE.TEXT.value,
        conversation: extractID(conversation),
        sender: { relationTo: sender.relationTo, value: extractID(sender.value) },
        content: content,
      },
    });
  }

  async isMessageRead(message: string | Message, user: string | User) {
    const { totalDocs } = await this.apiClient.count({
      collection: 'message-reads',
      where: {
        and: [{ message: { equals: extractID(message) } }, { user: { equals: extractID(user) } }],
      },
    });
    return totalDocs > 0;
  }

  async markMessageAsRead(message: string | Message, user: string | User) {
    return this.apiClient.create({
      collection: 'message-reads',
      data: {
        message: extractID(message),
        user: extractID(user),
        readAt: new Date().toISOString(),
      },
    });
  }
}
