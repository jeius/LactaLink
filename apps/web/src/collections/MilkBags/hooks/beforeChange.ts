import { hookLogger } from '@lactalink/agents/payload';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook, PayloadRequest } from 'payload';

export const beforeChange: CollectionBeforeChangeHook<MilkBag> = async ({
  data,
  operation,
  originalDoc,
  req,
  collection,
}) => {
  const logger = hookLogger(req, collection.slug, 'beforeChange');

  // Create operations
  if (operation === 'create') {
  }

  // Update operations
  if (operation === 'update') {
  }

  // Handle title generation based on code and volume
  if (data?.code && data?.volume) {
    data.title = `${data.code} - ${data.volume} mL`;
  }

  // Handle bag image upload/update
  const imageID = extractID(originalDoc?.bagImage) ?? extractID(data.bagImage);
  const upsertedImage = await upsertBagImage(req, imageID);
  if (upsertedImage) {
    data.bagImage = upsertedImage.id;
    logger.info('Upserted bag image', { imageID: upsertedImage?.id });
  }

  return data;
};

async function upsertBagImage(req: PayloadRequest, imageID?: string | null) {
  const file = req.file;
  if (!file) return null;

  if (imageID) {
    return req.payload.update({
      collection: 'milk-bag-images',
      id: imageID,
      data: {},
      file: file,
      req,
    });
  }

  return req.payload.create({
    collection: 'milk-bag-images',
    data: {},
    file: file,
    req,
  });
}
