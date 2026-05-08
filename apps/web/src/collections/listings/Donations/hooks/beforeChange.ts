import { hookLogger } from '@lactalink/agents/payload';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook, PayloadRequest } from 'payload';

export const beforeChange: CollectionBeforeChangeHook<Donation> = async ({
  data,
  req,
  operation,
  collection,
}) => {
  if (operation === 'update') {
    const logger = hookLogger(req, collection.slug, 'beforeUpdate');
    const { details } = data;
    if (!details) return data;

    const imageID = extractID(details?.milkSample?.[0]);
    const upsertedImage = await upsertImage(req, imageID, logger);

    if (upsertedImage) {
      data.details = {
        ...details,
        milkSample: [upsertedImage.id],
      };
    }
  }

  return data;
};

async function upsertImage(
  req: PayloadRequest,
  imageID?: string | null,
  logger?: ReturnType<typeof hookLogger>
) {
  const file = req.file;
  if (!file) return null;

  if (imageID) {
    logger?.info('Updating donation image', { imageID, hasFile: !!file });
    return req.payload.update({
      collection: 'images',
      id: imageID,
      data: {},
      file: file,
      req,
    });
  }

  logger?.info('Creating donation image', { hasFile: !!file });

  return req.payload.create({
    collection: 'images',
    data: {},
    file: file,
    req,
  });
}
