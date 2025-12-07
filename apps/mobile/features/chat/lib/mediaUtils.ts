import { transformImage } from '@/lib/utils/imageProcessors';
import {
  CameraType,
  ImagePickerOptions,
  ImagePickerResult,
  launchCameraAsync,
  launchImageLibraryAsync,
} from 'expo-image-picker';

const basePickerOptions: ImagePickerOptions = {
  allowsEditing: false,
  quality: 0.8,
  mediaTypes: 'images',
  selectionLimit: 10,
  allowsMultipleSelection: true,
  orderedSelection: true,
};

export async function pickImage() {
  const result = await launchImageLibraryAsync({
    ...basePickerOptions,
    defaultTab: 'photos',
  });
  return transform(result);
}

export async function takePhoto() {
  const result = await launchCameraAsync({
    ...basePickerOptions,
    cameraType: CameraType.back,
  });
  return transform(result);
}

async function transform(result: ImagePickerResult) {
  if (result.canceled) return;
  return Promise.all(result.assets.map((asset) => transformImage(asset)));
}
