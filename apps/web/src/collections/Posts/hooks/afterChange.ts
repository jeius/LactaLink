import { hookLogger } from '@lactalink/agents/payload';
import { Post } from '@lactalink/types/payload-generated-types';
import { CollectionAfterChangeHook } from 'payload';
import { deleteOrphanedImages, updatePostSharesCount } from '../helpers';

export const afterChange: CollectionAfterChangeHook<Post> = async ({
  doc,
  req,
  collection,
  operation,
  previousDoc,
}) => {
  if (operation === 'create') {
    const logger = hookLogger(req, collection.slug, 'afterCreate');
    await updatePostSharesCount({ req, doc, operation, logger });
  }

  if (operation === 'update') {
    const logger = hookLogger(req, collection.slug, 'afterUpdate');
    await deleteOrphanedImages(doc, previousDoc, req, logger);
  }

  return doc;
};
