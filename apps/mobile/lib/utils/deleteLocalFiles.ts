import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { File } from 'expo-file-system/next';

export function deleteLocalFiles(uris: string[]) {
  uris.forEach(async (uri) => {
    try {
      const file = new File(uri);
      file.delete();
    } catch (error) {
      console.error(`Failed to delete file at ${uri}:`, extractErrorMessage(error));
    }
  });
}
