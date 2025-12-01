import { Message } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';

export const verifySender: CollectionBeforeChangeHook<Message> = async ({
  req,
  operation,
  data,
  originalDoc,
}) => {
  if (!req.user) return data;

  const userProfile = req.user.profile && {
    relationTo: req.user.profile.relationTo,
    value: extractID(req.user.profile.value),
  };
  if (!userProfile) return data;

  // Create search vector from content
  data.searchVector = `${data.content}`.toLowerCase();

  if (operation === 'create') {
    data.sender = userProfile;

    // Verify sender is participant
    const participant = await req.payload.count({
      req,
      collection: 'conversation-participants',
      where: {
        and: [
          { conversation: { equals: extractID(data.conversation) } },
          { participant: { equals: req.user.id } },
        ],
      },
    });

    if (participant.totalDocs === 0) {
      throw new Error('You are not a participant in this conversation');
    }
  }

  if (operation === 'update' && originalDoc) {
    if (originalDoc.content !== data.content) {
      data.edited = true;
      data.editedAt = new Date().toISOString();
    }
  }

  return data;
};
