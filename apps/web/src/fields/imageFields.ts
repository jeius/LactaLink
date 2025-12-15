import { extractID } from '@lactalink/utilities/extractors';
import { encode } from 'blurhash';
import { Field } from 'payload';
import sharp from 'sharp';

export const imageFields: Field[] = [
  {
    name: 'alt',
    label: 'Alt Text',
    type: 'text',
    hasMany: false,
    // validate: () => true,
    admin: {
      description:
        'Alternative text for the image, used for accessibility purposes. If not provided, it will be auto-generated upon upload.',
    },
    hooks: {
      beforeChange: [
        async ({ value, req }) => {
          // Only generate when there is no alt.
          if (value && value !== '') return value;

          if (!req.user) return value;

          if (!req.file || !req.file.mimetype.startsWith('image/')) return value;

          let name = req.user.email;

          if (req.user.profile) {
            const { displayName } = await req.payload.findByID({
              collection: req.user.profile.relationTo,
              id: extractID(req.user.profile.value),
              select: { displayName: true },
              req,
            });
            if (displayName) name = displayName;
          }

          return `Photo uploaded by ${name}`;
        },
      ],
    },
  },

  {
    name: 'blurHash',
    label: 'Blur Hash',
    type: 'text',
    hasMany: false,
    // validate: () => true,
    admin: {
      description: 'A string that represents a blurred version of the image (Auto generated).',
      position: 'sidebar',
      readOnly: true,
    },
    hooks: {
      beforeChange: [
        async ({ value, req, originalDoc }) => {
          // Only generate when there is no blurHash.
          if (value && value !== '') return value;

          const file = req.file;

          if (!file) {
            req.payload.logger.warn('No file provided for BlurHash generation');
            return value; // Skip if no file is present
          }

          // Only process images
          if (!file.mimetype.startsWith('image/')) return value;

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

            req.payload.logger.info(
              { imageId: originalDoc?.id, blurHash },
              'Generated BlurHash for image'
            );

            return blurHash;
          } catch (error) {
            req.payload.logger.error(
              {
                imageId: originalDoc?.id,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
              'Failed to generate BlurHash'
            );
            // Don't throw error to avoid breaking image upload
          }

          return value;
        },
      ],
    },
  },
];
