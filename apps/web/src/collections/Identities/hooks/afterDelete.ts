import { Identity } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterDeleteHook } from 'payload';

export const deleteImages: CollectionAfterDeleteHook<Identity> = async ({ req, doc }) => {
  // Clean up related identity images
  const deleteImage = (id: string) =>
    req.payload.delete({
      collection: 'identity-images',
      id,
      overrideAccess: true,
      req,
      depth: 0,
    });

  await Promise.all([deleteImage(extractID(doc.idImage)), deleteImage(extractID(doc.refImage))]);
  return doc;
};
