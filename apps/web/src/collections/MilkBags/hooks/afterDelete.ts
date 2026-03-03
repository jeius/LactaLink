import { MilkBag } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterDeleteHook } from 'payload';

export const afterDelete: CollectionAfterDeleteHook<MilkBag> = async ({ req, doc, collection }) => {
  const docsToDelete: { id: string; collection: CollectionSlug }[] = [];

  const image = doc.bagImage;

  if (image) {
    docsToDelete.push({ id: extractID(image), collection: 'milk-bag-images' });
  }

  await Promise.all(
    docsToDelete.map(({ id, collection }) =>
      req.payload.delete({
        id,
        collection,
        req,
        overrideAccess: true,
      })
    )
  );

  req.payload.logger.info(
    {
      bagImage: 1,
    },
    `Deleted associated documents for ${collection.labels.singular} ${doc.id}`
  );
};
