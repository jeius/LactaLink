import { transformImage } from '@/lib/utils/imageProcessors';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { ImagePickerResult } from 'expo-image-picker';
import { toast } from 'sonner-native';

export async function transformPickerResult(pickerResult: ImagePickerResult) {
  if (pickerResult.canceled || pickerResult.assets.length === 0) {
    return;
  }

  const pickedImage = pickerResult.assets[0]!;
  const transformedImage = await transformImage(pickedImage).catch((err) => {
    toast.error(extractErrorMessage(err));
    return null;
  });

  return transformedImage;
}
