import { CONVERSATION_ROLE } from '@lactalink/enums';
import { UserProfile } from '@lactalink/types';
import type {
  Conversation,
  ConversationParticipant,
} from '@lactalink/types/payload-generated-types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { IApiClient } from '../../interfaces/ApiClient';
import { CreateConvoParticipantError } from './errors';

const MEMBER_ROLE = CONVERSATION_ROLE.MEMBER.value;
const ADMIN_ROLE = CONVERSATION_ROLE.ADMIN.value;

interface ParticipantConfig {
  userId: string;
  role?: ConversationParticipant['role'];
}

type CreateGroupChatData = {
  name: string;
  participants: UserProfile[];
};

/**
 * Creates a conversation with the specified type and metadata
 */
async function createConversation(
  params: Pick<Conversation, 'title' | 'type' | 'createdBy'>,
  apiClient: IApiClient
): Promise<Conversation> {
  return apiClient.create({
    collection: 'conversations',
    data: {
      type: params.type,
      title: params.title,
      createdBy: params.createdBy,
    },
  });
}

/**
 * Creates a single conversation participant
 */
async function createParticipant(
  conversationId: string,
  config: ParticipantConfig,
  apiClient: IApiClient
): Promise<ConversationParticipant> {
  return apiClient.create({
    collection: 'conversation-participants',
    data: {
      conversation: conversationId,
      participant: config.userId,
      role: config.role ?? MEMBER_ROLE,
    },
  });
}

/**
 * Creates multiple conversation participants
 */
async function createParticipants(
  conversationId: string,
  configs: ParticipantConfig[],
  apiClient: IApiClient
) {
  const successfulParticipants: ConversationParticipant[] = [];
  try {
    return Promise.all(
      configs.map(async (config) => {
        const participant = await createParticipant(conversationId, config, apiClient);
        successfulParticipants.push(participant);
        return participant;
      })
    );
  } catch (error) {
    throw new CreateConvoParticipantError(extractErrorMessage(error), successfulParticipants);
  }
}

/**
 * Cleanup function for failed conversation creation
 */
async function cleanupConversation(
  conversationId: string,
  participants: ConversationParticipant[],
  apiClient: IApiClient
): Promise<void> {
  await Promise.all([
    ...participants.map((p) =>
      apiClient.deleteByID({ collection: 'conversation-participants', id: p.id })
    ),
    apiClient.deleteByID({ collection: 'conversations', id: conversationId }),
  ]);
}

/**
 * Extracts user IDs from participant data
 */
function extractParticipantIds(participants: CreateGroupChatData['participants']): string[] {
  return participants.map((p) => {
    const doc = extractCollection(p.value);
    if (!doc) throw new Error('Invalid participant data');

    const ownerId = extractID(doc.owner);
    if (!ownerId) throw new Error('Invalid participant user ID');

    return ownerId;
  });
}

export {
  ADMIN_ROLE,
  cleanupConversation,
  createConversation,
  createParticipants,
  extractParticipantIds,
  MEMBER_ROLE,
};

export type { CreateGroupChatData, ParticipantConfig };
