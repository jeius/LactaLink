import { getApiClient } from '@lactalink/api';
import { CollectionData, CreateArgs, FileCollection, FileCollectionSlug } from '@lactalink/types';
import { NativeFile } from '../types';

const FormData = global.FormData;

type FileData = CollectionData<FileCollection>;
export function createNativeFile<T extends FileData>(data: T): NativeFile {
  if (!data.url || !data.filename || !data.mimeType) {
    throw new Error('Invalid file parameters. Ensure url, name, and type are provided.');
  }
  return { uri: data.url, name: data.filename, type: data.mimeType };
}

export async function uploadFile<T extends FileCollectionSlug = FileCollectionSlug>(
  file: NativeFile,
  collection: T
) {
  const client = getApiClient();

  const data = new FormData();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.append('file', file as any); // Cast to any to satisfy FormData type requirements

  const args: CreateArgs<T> = {
    data,
    collection,
    depth: 2,
  } as CreateArgs<T>;

  const res = await client.createFile(args);
  return res;
}
