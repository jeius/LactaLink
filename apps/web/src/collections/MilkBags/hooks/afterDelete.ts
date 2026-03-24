import { hookLogger } from '@lactalink/agents/payload';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterDeleteHook } from 'payload';

/**
 * After a milk bag is deleted, this hook checks if there are any associated documents (like images)
 * that also need to be deleted.
 */
export const afterDelete: CollectionAfterDeleteHook<MilkBag> = async ({ req, doc, collection }) => {
  const logger = hookLogger(req, collection.slug, 'afterDelete');
  const docsToDelete = new Map<CollectionSlug, Set<string>>();

  const image = doc.bagImage;
  if (image) {
    docsToDelete.set('milk-bag-images', new Set([extractID(image)]));
  }

  await Promise.all(
    docsToDelete.entries().map(([collection, ids]) =>
      req.payload.delete({
        collection,
        where: { id: { in: Array.from(ids) } },
        req,
        overrideAccess: true,
      })
    )
  );

  logger.info(`Deleted associated documents for milk bag ${doc.id}`, {
    bagImage: 1,
  });
};
