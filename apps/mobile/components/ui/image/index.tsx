'use client';
import { addAuthHeadersInImageSource } from '@/lib/utils/addAuthHeadersInImageSource';
import { createImage } from '@gluestack-ui/core/image/creator';
import { type VariantProps, tva } from '@gluestack-ui/utils/nativewind-utils';
import { Image as ExpoImage } from 'expo-image';
import { cssInterop } from 'nativewind';
import React, { useMemo } from 'react';
import { Platform } from 'react-native';

const StyledImage = cssInterop(ExpoImage, { className: 'style' });

const imageStyle = tva({
  base: 'max-w-full',
  variants: {
    size: {
      '2xs': 'h-6 w-6',
      xs: 'h-10 w-10',
      sm: 'h-16 w-16',
      md: 'h-20 w-20',
      lg: 'h-24 w-24',
      xl: 'h-32 w-32',
      '2xl': 'h-44 w-44',
      '3xl': 'h-64 w-64',
      full: 'h-full w-full',
      none: '',
    },
  },
});

const UIImage = createImage({ Root: StyledImage });

type ImageProps = VariantProps<typeof imageStyle> & React.ComponentProps<typeof UIImage>;

const Image = React.forwardRef<React.ComponentRef<typeof UIImage>, ImageProps>(function Image(
  { size = 'md', className, source, ...props },
  ref
) {
  const newSource = useMemo(() => addAuthHeadersInImageSource(source), [source]);
  return (
    <UIImage
      className={imageStyle({ size, class: className })}
      {...props}
      ref={ref}
      source={newSource}
      // @ts-expect-error : web only
      style={Platform.OS === 'web' ? { height: 'revert-layer', width: 'revert-layer' } : undefined}
    />
  );
});

Image.displayName = 'Image';
export { Image };
export type { ImageProps };
