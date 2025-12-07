import { getHexColor } from '@/lib/colors';
import { BLUR_HASH } from '@/lib/constants';
import { ImageData } from '@lactalink/types';
import { Galeria } from '@nandorojo/galeria';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import React, { ComponentProps, useCallback } from 'react';
import { GestureResponderEvent, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from './AppProvider/ThemeProvider';
import { Image } from './Image';
import { Pressable, PressableProps } from './ui/pressable';
import { Text } from './ui/text';

interface ImageViewerProps
  extends Pick<ComponentProps<typeof Image>, 'contentFit'>,
    Omit<PressableProps, 'style'> {
  images: ImageData[];
  initialIndex?: number;
  imageStyle?: ComponentProps<typeof Image>['style'];
  style?: StyleProp<ViewStyle>;
}

export function ImageViewer({
  images,
  initialIndex = 0,
  contentFit = 'cover',
  disabled = false,
  imageStyle,
  ...props
}: ImageViewerProps) {
  const { theme } = useTheme();
  const imageURIs = images.map((image) => image.uri).filter((v) => v !== null);

  const renderItem: ListRenderItem<ImageData> = useCallback(
    ({ item, index }) => {
      const backgroundColor = getHexColor('light', 'background', 800)?.toString();
      return (
        <Galeria.Image index={index} style={{ backgroundColor }}>
          <Image
            source={src(item.uri)}
            recyclingKey={`image-${item.uri}-${index}`}
            placeholder={{ blurhash: item.blurHash || BLUR_HASH }}
            style={[{ width: '100%', height: '100%' }, StyleSheet.flatten(imageStyle)]}
            contentFit={contentFit}
            alt={`Image ${index + 1}`}
            accessibilityLabel={`Image ${index + 1}`}
          />
        </Galeria.Image>
      );
    },
    [contentFit, imageStyle]
  );

  return (
    <Pressable {...props} pointerEvents={disabled ? 'none' : 'auto'} android_disableSound>
      <Galeria urls={imageURIs} theme={theme}>
        <FlashList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="grow"
          data={images}
          keyExtractor={(item, index) => `image-${item.uri}-${index}`}
          renderItem={renderItem}
          initialScrollIndex={initialIndex}
          pagingEnabled
        />
      </Galeria>
    </Pressable>
  );
}

interface SingleImageViewerProps extends Omit<ImageViewerProps, 'initialIndex' | 'images'> {
  image?: ImageData | null;
}
export function SingleImageViewer({
  image,
  contentFit,
  disabled = false,
  ...props
}: SingleImageViewerProps) {
  const { theme } = useTheme();
  const backgroundColor = getHexColor('light', 'background', 800)?.toString();

  function handlePress(e: GestureResponderEvent) {
    props.onPress?.(e);
    if (e.isDefaultPrevented()) return;
  }

  return image?.uri ? (
    <Pressable
      {...props}
      pointerEvents={disabled ? 'none' : 'auto'}
      onPress={handlePress}
      android_disableSound
    >
      <Galeria urls={[image.uri]} theme={theme}>
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
    </Pressable>
  ) : (
    <Text size="xs" className="flex-1 text-center align-middle">
      No Image
    </Text>
  );
}

function src(uri: string | null) {
  return typeof uri === 'string' ? { uri } : uri;
}
