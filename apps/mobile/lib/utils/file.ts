import { ApiOptions, Config, HasUploadSlug } from '@lactalink/types';
import { uploadFile as upload } from '@lactalink/utilities';
import { NativeFile } from '../types';

const FormData = global.FormData;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createNativeFile(params: NativeFile): any {
  return params;
}

export function uploadFile<T extends HasUploadSlug>(
  data: NativeFile,
  options: Omit<ApiOptions<T, 'CREATE'>, 'data'>
): Promise<Config['collections'][T]> | null {
  const file = createNativeFile(data);
  const fd = new FormData();
  fd.append('file', file);

  return upload<T>({
    ...options,
    data: fd,
  });
}
