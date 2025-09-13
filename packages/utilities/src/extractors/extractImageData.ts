import { CollectionWithBlurHash } from '@lactalink/types/collections';

const BLUR_HASH =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

type Size = 'sm' | 'lg' | 'original';

type Image = CollectionWithBlurHash;

type TImage = Image | null | undefined;

type ImageData = {
  uri: string | null;
  alt: string;
  blurHash: string;
};

type ExtractImageData<T> = T extends TImage[] ? ImageData[] : T extends Image ? ImageData : null;

export function extractImageData<T extends TImage | TImage[]>(
  image: T,
  size: Size = 'original'
): ExtractImageData<T> {
  if (Array.isArray(image)) {
    return image.map((img) => getImageData(img, size)).filter(Boolean) as ExtractImageData<T>;
  } else {
    return getImageData(image, size) as ExtractImageData<T>;
  }
}

export function extractOneImageData(
  image: (Image | null | undefined) | (Image | null | undefined)[],
  size: Size = 'original'
): ImageData {
  let img = extractImageData(image, size);
  if (Array.isArray(img)) {
    img = img[0] || null;
  }
  return img || { uri: null, alt: 'No Image', blurHash: BLUR_HASH };
}

function getImageData<T extends Image | null | undefined>(
  image: T,
  size: Size = 'original'
): ExtractImageData<T> {
  if (!image) return null as ExtractImageData<T>;

  let uri = image.url || null;
  const blurHash = image?.blurHash || BLUR_HASH;
  const alt = image?.alt || 'Image';

  if (image.sizes) {
    switch (size) {
      case 'sm': {
        if ('small' in image.sizes) {
          uri = image.sizes.small?.url || null;
        } else {
          uri = image.sizes.thumbnail?.url || null;
        }
        break;
      }
      case 'lg': {
        if ('large' in image.sizes) {
          uri = image.sizes.large?.url || null;
        }

        break;
      }
      default:
        break;
    }
  }

  return { uri, blurHash, alt } as ExtractImageData<T>;
}
