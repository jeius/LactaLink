import { transformImage } from '@/lib/utils/imageProcessors';
import { ImagePickerResult } from 'expo-image-picker';
import { toast } from 'sonner-native';

export async function transformPickerResult(pickerResult: ImagePickerResult) {
  if (pickerResult.canceled || pickerResult.assets.length === 0) {
    return;
  }

  const errors: string[] = [];
  const imagesToTransform = pickerResult.assets.map((asset) =>
    transformImage(asset).catch(() => {
      errors.push(asset.fileName || 'Unknown image');
      return Promise.resolve(null);
    })
  );

  const transformedImages = await Promise.all(imagesToTransform);

  if (errors.length > 0) {
    toast.error(`Failed to process: ${errors.join(', ')}`);
  }

  return transformedImages;
}
