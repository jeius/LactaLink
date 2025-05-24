import { getApiClient } from '@lactalink/api';
import {
  ApiClientArgsWithoutPagination,
  CollectionData,
  CreateArgs,
  FileCollection,
  FileCollectionSlug,
} from '@lactalink/types';
import { NativeFile } from '../types';

const FormData = global.FormData;

type FileData = CollectionData<FileCollection>;
export function createNativeFile<T extends FileData>(data: T): NativeFile {
  if (!data.url || !data.filename || !data.mimeType) {
    throw new Error('Invalid file parameters. Ensure url, name, and type are provided.');
  }
  return { uri: data.url, name: data.filename, type: data.mimeType };
}

type UploadFileOptions<T extends FileCollectionSlug> = Omit<
  ApiClientArgsWithoutPagination<T>,
  'collection'
>;
export async function uploadFile<T extends FileCollectionSlug = FileCollectionSlug>(
  file: NativeFile,
  collection: T,
  options?: UploadFileOptions<T>
) {
  const client = getApiClient();

  const data = new FormData();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.append('file', file as any); // Cast to any to satisfy FormData type requirements

  const args: CreateArgs<T> = {
    data,
    select: { id: true, url: true },
    depth: 2,
    collection,
    // Include any additional options passed
    ...options,
  } as CreateArgs<T>;

  return await client.createFile(args);
}
