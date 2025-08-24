import { FileCollection } from '@lactalink/types/collections';
import { ImageSchema } from '@lactalink/types/forms';

export function extractImageSchema(image?: FileCollection | null): ImageSchema | null {
  if (!image || !image.url) return null;
  return {
    filename: image.filename || 'image.jpg',
    mimeType: image.mimeType || 'image/jpeg',
    url: image.url,
    width: image.width || 300,
    height: image.height || 300,
    alt: image.alt || 'Image',
    filesize: image.filesize || 0,
  };
}
