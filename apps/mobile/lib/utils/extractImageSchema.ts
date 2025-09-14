import { ImageSchema } from '@lactalink/form-schemas';
import { FileCollection } from '@lactalink/types/collections';

export function extractImageSchema<T extends FileCollection | null>(
  image?: T
): T extends FileCollection ? ImageSchema : null {
  if (!image || !image.url) return null as T extends FileCollection ? ImageSchema : null;
  return {
    filename: image.filename || 'image.jpg',
    mimeType: image.mimeType || 'image/jpeg',
    url: image.url,
    width: image.width || 300,
    height: image.height || 300,
    alt: image.alt || 'Image',
    filesize: image.filesize || 0,
    blurhash: image.blurHash || undefined,
  } as T extends FileCollection ? ImageSchema : null;
}
