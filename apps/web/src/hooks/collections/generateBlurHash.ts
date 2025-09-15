import { CollectionWithBlurHash } from '@lactalink/types/collections';
import { encode } from 'blurhash';
import { CollectionBeforeChangeHook } from 'payload';
import sharp from 'sharp';

export const generateBlurHash: CollectionBeforeChangeHook<CollectionWithBlurHash> = async ({
  data,
  req,
}) => {
  // Only generate when there is no blurHash and operation is on create.
  if (data.blurHash) return data;

  const file = req.file;

  if (!file) {
    req.payload.logger.warn('No file provided for BlurHash generation');
    return data; // Skip if no file is present
  }

  try {
    // Convert image to smaller size for better performance
    const { data: pixels, info } = await sharp(file.data)
      .resize(32, 32, { fit: 'inside' }) // Small size for fast processing
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Generate BlurHash
    const blurHash = encode(
      new Uint8ClampedArray(pixels),
      info.width,
      info.height,
      4, // X components (4 is recommended)
      4 // Y components (4 is recommended)
    );

    data.blurHash = blurHash;

    req.payload.logger.info({ imageId: data.id, blurHash }, 'Generated BlurHash for image');
  } catch (error) {
    req.payload.logger.error(
      { imageId: data.id, error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to generate BlurHash'
    );
    // Don't throw error to avoid breaking image upload
  }

  return data;
};
