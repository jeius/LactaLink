import { appendHeaders } from '@/lib/utils/appendHeaders';
import { Image as ExpoImage, type ImageProps } from 'expo-image';

export function Image(props: ImageProps) {
  const transformedSource = appendHeaders(props);
  return <ExpoImage {...props} source={transformedSource} />;
}
