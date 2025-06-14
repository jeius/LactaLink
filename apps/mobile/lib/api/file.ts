import { getApiClient } from '@lactalink/api';
import { CreateFileArgs, FileCollectionSlug, ImageSchema } from '@lactalink/types';
import { NativeFile } from '../types';

const FormData = global.FormData;

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
  const fd = new FormData();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fd.append('file', file as any); // Cast to any to satisfy FormData type requirements

  const args: CreateFileArgs<TSlug> = { data: fd, collection };

  const res = await apiClient.createFile(args);
  return res;
}
