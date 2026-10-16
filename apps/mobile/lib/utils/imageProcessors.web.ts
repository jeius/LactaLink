import { ImageSchema } from '@lactalink/form-schemas';

async function getImageDetails(uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = document.createElement('img');
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = uri;
  });

  return { blob, ...dimensions };
}

export async function compressImage(uri: string) {
  const { blob, width, height } = await getImageDetails(uri);
  const extension = blob.type.split('/')[1] || 'jpeg';
  return {
    uri,
    mimeType: blob.type || 'image/jpeg',
    width,
    height,
    extension,
    size: blob.size,
  };
}

export async function transformImage(
  pickedImage: { uri: string; fileName?: string | null },
  fileName?: string
): Promise<Omit<ImageSchema, 'id' | 'blurhash'>> {
  const image = await compressImage(pickedImage.uri);
  const name =
    (fileName && `${fileName}.${image.extension}`) ||
    pickedImage.fileName ||
    `${crypto.randomUUID()}.${image.extension}`;

  return {
    filename: name,
    mimeType: image.mimeType,
    filesize: image.size,
    width: image.width,
    height: image.height,
    url: image.uri,
    alt: 'Image',
  };
}
