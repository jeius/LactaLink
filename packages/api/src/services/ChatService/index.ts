import { FindDirectConversationParams } from '@lactalink/form-schemas/validators';
import { ApiFetchResponse } from '@lactalink/types/api';
import { Conversation, ConversationParticipant } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { IApiClient } from 'src/interfaces/ApiClient';

type Participant = ConversationParticipant['participant'];

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
}
