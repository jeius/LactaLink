import { getApiClient } from '@lactalink/api';
import { ImageSchema } from '@lactalink/form-schemas';
import { FileCollectionSlug } from '@lactalink/types/collections';
import { NativeFile } from '../types';

type FileData = { url: string; filename: string; mimeType: string };
export function createNativeFile(data: FileData): NativeFile {
  if (!data.url || !data.filename || !data.mimeType) {
    throw new Error('Invalid file parameters. Ensure url, name, and type are provided.');
  }
  return { uri: data.url, name: data.filename, type: data.mimeType };
}

export async function uploadImage<TSlug extends FileCollectionSlug = FileCollectionSlug>(
  collection: TSlug,
  data: ImageSchema
) {
  const apiClient = getApiClient();

  const file = createNativeFile(data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await apiClient.uploadFile({ collection, file: file as any, data: { alt: data.alt } });
}
