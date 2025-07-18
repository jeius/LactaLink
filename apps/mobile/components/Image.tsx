import { BLUR_HASH } from '@/lib/constants';
import { appendHeaders } from '@/lib/utils/appendHeaders';
import { Image as ExpoImage, type ImageProps } from 'expo-image';

export function Image(props: ImageProps) {
  const transformedSource = appendHeaders(props);
  return (
    <ExpoImage
      {...props}
      placeholder={props.placeholder || { blurhash: BLUR_HASH }}
      source={transformedSource}
    />
  );
}
