import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { File } from 'expo-file-system';

export function deleteLocalFiles(uris: string[]) {
  uris.forEach(async (uri) => {
    try {
      const file = new File(uri);
      if (!file.exists) return;
      file.delete();
    } catch (error) {
      console.error(`Failed to delete file at ${uri}:`, extractErrorMessage(error));
    }
  });
}
