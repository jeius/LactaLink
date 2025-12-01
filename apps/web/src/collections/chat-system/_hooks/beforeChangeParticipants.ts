import { CONVERSATION_ROLE } from '@lactalink/enums';
import { ConversationParticipant } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';

export const validateParticipantPermissions: CollectionBeforeChangeHook<
  ConversationParticipant
> = async ({ req, operation, data, originalDoc }) => {
  if (!req.user || operation !== 'update') return data;

  if (data.role && originalDoc) {
    // Prevent users from changing their own role
    if (originalDoc.participant === req.user.id && data.role !== originalDoc.role) {
      throw new Error('You cannot change your own role');
    }

    // Verify requester is admin in the conversation
    const requesterParticipant = await req.payload.count({
      collection: 'conversation-participants',
      where: {
        and: [
          { conversation: { equals: extractID(originalDoc.conversation) } },
          { participant: { equals: req.user.id } },
          { role: { equals: CONVERSATION_ROLE.ADMIN.value } },
        ],
      },
    });

    if (requesterParticipant.totalDocs === 0) {
      throw new Error('Only conversation admins can change participant roles');
    }
  }

  return data;
};
