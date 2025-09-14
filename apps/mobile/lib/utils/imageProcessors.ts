import { ImageSchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { File } from 'expo-file-system/next';
import { ImagePickerAsset } from 'expo-image-picker';
import { Image, getImageMetaData } from 'react-native-compressor';
import { IMAGE_COMPRESSION_SIZE, MAX_IMAGE_SIZE } from '../constants';

export async function compressImage(uri: string) {
  let imageFile = new File(uri);
  const fileSize = imageFile.size;

  if (fileSize && fileSize >= MAX_IMAGE_SIZE) {
    const result = await Image.compress(uri, {
      compressionMethod: 'manual',
      maxWidth: IMAGE_COMPRESSION_SIZE,
      maxHeight: IMAGE_COMPRESSION_SIZE,
      quality: 1,
      input: 'uri',
      output: 'jpg',
      returnableOutputType: 'uri',
    }).catch((error) => {
      console.error(`Image compression failed: ${extractErrorMessage(error)}`);
      throw new Error('Image compression failed', { cause: extractErrorMessage(error) });
    });

    try {
      const file = new File(uri);
      file.delete();
    } catch (error) {
      console.error('Failed to delete original image: ', extractErrorMessage(error));
    }

    imageFile = new File(result);
  }

  const { ImageHeight, ImageWidth, Orientation, ...resultDetails } = await getImageMetaData(
    imageFile.uri
  );

  return {
    uri: imageFile.uri,
    mimeType: imageFile.type || 'image/jpeg',
    width: ImageWidth,
    height: ImageHeight,
    orientation: Orientation,
    ...resultDetails,
  };
}

export async function transformImage(
  pickedImage: ImagePickerAsset,
  fileName?: string
): Promise<ImageSchema> {
  const compressedImage = await compressImage(pickedImage.uri).catch((err) => {
    throw new Error('Failed to compress image, try using a smaller image.', {
      cause: extractErrorMessage(err),
    });
  });

  const extension = compressedImage.extension;
  const name =
    (fileName && `${fileName}.${extension}`) ||
    pickedImage.fileName ||
    `${crypto.randomUUID()}.${extension}`;

  return {
    filename: name,
    mimeType: compressedImage.mimeType,
    filesize: compressedImage.size,
    width: compressedImage.width,
    height: compressedImage.height,
    url: compressedImage.uri,
    alt: 'Image',
  };
}
