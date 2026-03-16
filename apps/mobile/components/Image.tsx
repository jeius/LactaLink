import { addAuthHeadersInImageSource } from '@/lib/utils/addAuthHeadersInImageSource';
import { Image as ExpoImage, type ImageProps } from 'expo-image';
import { cssInterop } from 'nativewind';

function Image({ source, ...props }: ImageProps) {
  const transformedSource = addAuthHeadersInImageSource(source);
  return <ExpoImage {...props} source={transformedSource} />;
}

const StyledImage = cssInterop(Image, { className: 'style' });

export { StyledImage as Image };
