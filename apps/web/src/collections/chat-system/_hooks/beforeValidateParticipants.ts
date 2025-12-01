import { ConversationParticipant } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import status from 'http-status';
import { APIError, CollectionBeforeValidateHook } from 'payload';

export const preventDuplicateParticipants: CollectionBeforeValidateHook<
  ConversationParticipant
> = async ({ req, operation, data }) => {
  if (!data || operation !== 'create' || !req.user) return data;
  // Prevent duplicate participants
  const { participant, conversation } = data;

  if (!participant || !conversation) return data;

  const existing = await req.payload.count({
    req,
    collection: 'conversation-participants',
    where: {
      and: [
        { conversation: { equals: extractID(conversation) } },
        { participant: { equals: extractID(participant) } },
      ],
    },
  });

  if (existing.totalDocs > 0) {
    throw new APIError('User is already a participant', status.CONFLICT, {
      user: req.user.id,
      participant,
    });
  }
  return data;
};
