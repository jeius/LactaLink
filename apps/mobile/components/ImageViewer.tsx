import { getHexColor } from '@/lib/colors';
import { BLUR_HASH } from '@/lib/constants';
import { Galeria } from '@nandorojo/galeria';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import React, { ComponentProps, useCallback, useState } from 'react';
import { GestureResponderEvent, useWindowDimensions } from 'react-native';
import { AnimatedPressable } from './animated/pressable';
import { Image } from './Image';
import { Box } from './ui/box';
import { Text } from './ui/text';

interface ImageViewerProps extends Pick<ComponentProps<typeof Image>, 'contentFit'> {
  images: { uri: string; blurHash?: string }[];
  initialIndex?: number;
}

export function ImageViewer({ images, initialIndex = 0, contentFit = 'cover' }: ImageViewerProps) {
  const windowSize = useWindowDimensions();
  const [{ width, height }, setSize] = useState({
    width: windowSize.width,
    height: windowSize.height,
  });

  const imageURIs = images.map((image) => image.uri);

  const renderItem: ListRenderItem<{ uri: string; blurHash?: string }> = useCallback(
    ({ item, index, extraData: { width, height } }) => {
      const backgroundColor = getHexColor('light', 'background', 800)?.toString();
      return (
        <Galeria.Image index={index} style={{ backgroundColor }}>
          <Image
            source={src(item.uri)}
            recyclingKey={item.uri + index}
            placeholder={{ blurhash: item.blurHash || BLUR_HASH }}
            style={{ width, height }}
            contentFit={contentFit}
            alt={`Image ${index + 1}`}
            accessibilityLabel={`Image ${index + 1}`}
          />
        </Galeria.Image>
      );
    },
    [contentFit]
  );

  return (
    <Galeria urls={imageURIs}>
      <Box
        className="flex-1"
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setSize({ width, height });
        }}
      >
        <FlashList
          horizontal
          data={images}
          keyExtractor={(item, index) => `image-${item.uri}-${index}`}
          renderItem={renderItem}
          extraData={{ width, height }}
          initialScrollIndex={initialIndex}
          pagingEnabled
        />
      </Box>
    </Galeria>
  );
}

interface SingleImageViewerProps
  extends Omit<ImageViewerProps, 'initialIndex' | 'images'>,
    ComponentProps<typeof AnimatedPressable> {
  disabled?: boolean;
  image?: { uri: string | null; blurHash?: string | null; alt?: string | null } | null;
}
export function SingleImageViewer({
  image,
  contentFit,
  disabled = false,
  ...props
}: SingleImageViewerProps) {
  const backgroundColor = getHexColor('light', 'background', 800)?.toString();

  function handlePress(e: GestureResponderEvent) {
    e.stopPropagation();
    props.onPress?.(e);
  }

  return image?.uri ? (
    <AnimatedPressable
      {...props}
      pointerEvents={disabled ? 'none' : 'auto'}
      disablePressAnimation={props.disablePressAnimation || true}
      onPress={handlePress}
      android_disableSound
    >
      <Galeria urls={[image.uri]}>
        <Galeria.Image style={{ backgroundColor }}>
          <Image
            source={src(image.uri)}
            recyclingKey={image.uri}
            placeholder={{ blurhash: image.blurHash || BLUR_HASH }}
            style={{ width: '100%', height: '100%' }}
            contentFit={contentFit}
            alt={image.alt || 'Image'}
            accessibilityLabel={image.alt || 'Image'}
          />
        </Galeria.Image>
      </Galeria>
    </AnimatedPressable>
  ) : (
    <Text size="xs" className="flex-1 text-center align-middle">
      No Image
    </Text>
  );
}

function src(uri: string) {
  return typeof uri === 'string' ? { uri } : uri;
}
