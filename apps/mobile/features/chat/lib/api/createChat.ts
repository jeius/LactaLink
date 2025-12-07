import { getChatService } from '@/lib/services/chat';
import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { CONVERSATION_ROLE, CONVERSATION_TYPE } from '@lactalink/enums';
import type {
  Conversation,
  ConversationParticipant,
  User,
} from '@lactalink/types/payload-generated-types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { produce } from 'immer';
import type { CreateGroupChatData, ParticipantConfig } from '../types';

const MEMBER_ROLE = CONVERSATION_ROLE.MEMBER.value;
const ADMIN_ROLE = CONVERSATION_ROLE.ADMIN.value;

class CreateConvoParticipantError extends Error {
  constructor(
    message: string,
    public data: ConversationParticipant[]
  ) {
    super(message);
    this.name = 'CreateConvoParticipantError';
  }
}

/**
 * Creates a conversation with the specified type and metadata
 */
async function createConversation(
  params: Pick<Conversation, 'title' | 'type' | 'createdBy'>
): Promise<Conversation> {
  const apiClient = getApiClient();

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
  config: ParticipantConfig
): Promise<ConversationParticipant> {
  const apiClient = getApiClient();

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
async function createParticipants(conversationId: string, configs: ParticipantConfig[]) {
  const successfulParticipants: ConversationParticipant[] = [];
  try {
    return Promise.all(
      configs.map(async (config) => {
        const participant = await createParticipant(conversationId, config);
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
  participants: ConversationParticipant[]
): Promise<void> {
  const apiClient = getApiClient();

  await Promise.all([
    ...participants.map((p) =>
      apiClient.deleteByID({ collection: 'conversation-participants', id: p.id })
    ),
    apiClient.deleteByID({ collection: 'conversations', id: conversationId }),
  ]);
}

/**
 * Wraps conversation with participant data
 */
function wrapConversationWithParticipants(
  conversation: Conversation,
  participants: ConversationParticipant[]
): Conversation {
  return produce(conversation, (draft) => {
    draft.participants = {
      docs: participants,
      totalDocs: participants.length,
      hasNextPage: false,
    };
  });
}

/**
 * Get the current user
 */
function getCurrentUser(): User {
  const meUser = getMeUser();
  if (!meUser) throw new Error('User not logged in');
  return meUser;
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

/**
 * Creates a group chat with multiple participants
 */
export async function createGroupChat(data: CreateGroupChatData): Promise<Conversation> {
  const meUser = getCurrentUser();
  const participantIds = extractParticipantIds(data.participants);

  const conversation = await createConversation({
    type: CONVERSATION_TYPE.GROUP.value,
    title: data.name.length > 0 ? data.name : undefined,
    createdBy: meUser.id,
  });

  // No need to create for the creator, they are auto-added as admin
  const participantConfigs = participantIds.map(
    (userId): ParticipantConfig => ({ userId, role: MEMBER_ROLE })
  );

  try {
    const participants = await createParticipants(conversation.id, participantConfigs);
    return wrapConversationWithParticipants(conversation, participants);
  } catch (error) {
    if (error instanceof CreateConvoParticipantError) {
      await cleanupConversation(conversation.id, error.data);
    }
    throw error;
  }
}

/**
 * Creates a direct chat between two users
 */
export async function createDirectChat(
  participant: ConversationParticipant['participant']
): Promise<Conversation> {
  const meUser = getCurrentUser();
  const participantId = extractID(participant);

  if (!participantId) {
    throw new Error('Invalid participant ID');
  }

  const chatService = getChatService();
  const existingConversation = await chatService.findDirectConversation([participant, meUser]);

  if (existingConversation) {
    return existingConversation;
  }

  const conversation = await createConversation({
    type: CONVERSATION_TYPE.DIRECT.value,
    createdBy: meUser.id,
  });

  // No need to create for the creator, they are auto-added as admin
  // Participants in a direct chat are always admins
  const participantConfigs: ParticipantConfig[] = [{ userId: participantId, role: ADMIN_ROLE }];

  try {
    const participants = await createParticipants(conversation.id, participantConfigs);
    return wrapConversationWithParticipants(conversation, participants);
  } catch (error) {
    if (error instanceof CreateConvoParticipantError) {
      await cleanupConversation(conversation.id, error.data);
    }
    throw error;
  }
}
