import { hookLogger } from '@lactalink/agents/payload';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterDeleteHook } from 'payload';

export const afterDelete: CollectionAfterDeleteHook<Post> = async ({ req, doc, collection }) => {
  const logger = hookLogger(req, collection.slug, 'afterDelete');

  const attachments = doc.attachments || [];
  const imagesToDelete = attachments
    .filter((att) => att.mediaType === 'IMAGE')
    .map((att) => extractID(att.image))
    .filter(Boolean) as string[];

  if (imagesToDelete.length > 0) {
    await req.payload.delete({
      collection: 'images',
      where: { id: { in: imagesToDelete } },
      req,
    });
    logger.info('Deleted associated images', { images: imagesToDelete.length });
  }
};
