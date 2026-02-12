import { appendHeaders } from '@/lib/utils/appendHeaders';
import { Image as ExpoImage, type ImageProps } from 'expo-image';
import { cssInterop } from 'nativewind';

function Image(props: ImageProps) {
  const transformedSource = appendHeaders(props);
  return <ExpoImage {...props} source={transformedSource} />;
}

const StyledImage = cssInterop(Image, { className: 'style' });

export { StyledImage as Image };
