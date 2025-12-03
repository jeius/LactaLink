import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { CONVERSATION_ROLE, CONVERSATION_TYPE } from '@lactalink/enums';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { produce } from 'immer';
import { CreateGroupChatData } from './types';

export async function createGroupChat(data: CreateGroupChatData) {
  const meUser = getMeUser();

  if (!meUser) {
    throw new Error('User not logged in');
  }

  const apiClient = getApiClient();

  const conversation = await apiClient.create({
    collection: 'conversations',
    data: {
      type: CONVERSATION_TYPE.GROUP.value,
      title: data.name.length > 0 ? data.name : undefined,
      createdBy: meUser.id,
    },
  });

  const participantIDs = data.participants.map((p) => {
    const doc = extractCollection(p.value);
    if (!doc) throw new Error('Invalid participant data');

    const ownerID = extractID(doc.owner);
    if (!ownerID) throw new Error('Invalid participant user ID');
    return ownerID;
  });

  const participantCreations = participantIDs.map((id) =>
    apiClient.create({
      collection: 'conversation-participants',
      data: {
        conversation: conversation.id,
        participant: id,
        role: CONVERSATION_ROLE.MEMBER.value,
      },
    })
  );

  // Add the creator as an admin
  participantCreations.push(
    apiClient.create({
      collection: 'conversation-participants',
      data: {
        conversation: conversation.id,
        participant: meUser.id,
        role: CONVERSATION_ROLE.ADMIN.value,
      },
    })
  );

  const convoParticipants = await Promise.all(participantCreations);

  return produce(conversation, (draft) => {
    draft.participants = {
      docs: convoParticipants,
      totalDocs: convoParticipants.length,
      hasNextPage: false,
    };
  });
}
