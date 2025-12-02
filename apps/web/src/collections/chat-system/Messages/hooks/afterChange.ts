import { Message } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';

export const updateLastMessage: CollectionAfterChangeHook<Message> = async ({
  req,
  doc,
  operation,
}) => {
  if (operation === 'create') {
    // Update conversation's lastMessageAt
    await req.payload.update({
      req,
      collection: 'conversations',
      id: extractID(doc.conversation),
      data: {
        lastMessageAt: doc.createdAt,
      },
    });
  }
  return doc;
};
