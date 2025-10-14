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

  return await apiClient.uploadFile({
    collection,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: file as any,
    // @ts-expect-error -- typing issue in api client
    data: { alt: data.alt },
  });
}

export async function upsertImage<TSlug extends FileCollectionSlug = FileCollectionSlug>(
  collection: TSlug,
  data: ImageSchema
) {
  const apiClient = getApiClient();
  const id = data.id;

  if (id) {
    return await apiClient.findByID({ collection, id });
  }
  return await uploadImage(collection, data);
}
