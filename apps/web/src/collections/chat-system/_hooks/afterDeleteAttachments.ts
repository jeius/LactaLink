import { MessageAttachment } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterDeleteHook } from 'payload';

export const deleteRelatedAttachment: CollectionAfterDeleteHook<MessageAttachment> = async ({
  req,
  doc,
}) => {
  if (!doc?.attachment) return doc;

  if (doc.attachment.relationTo === 'message-media') {
    await req.payload.delete({
      collection: 'message-media',
      id: extractID(doc.attachment.value),
      req,
    });
  }

  return doc;
};
