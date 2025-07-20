import { getHexColor } from '@/lib/colors';
import { Galeria } from '@nandorojo/galeria';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import React, { ComponentProps, useCallback, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Image } from './Image';
import { Box } from './ui/box';

interface ImageViewerProps extends Pick<ComponentProps<typeof Image>, 'contentFit'> {
  imageURIs: string[];
  initialIndex?: number;
}

export function ImageViewer({
  imageURIs,
  initialIndex = 0,
  contentFit = 'cover',
}: ImageViewerProps) {
  const windowSize = useWindowDimensions();
  const [{ width, height }, setSize] = useState({
    width: windowSize.width,
    height: windowSize.height,
  });

  const renderItem: ListRenderItem<string> = useCallback(
    ({ item, index, extraData: { width, height } }) => {
      const backgroundColor = getHexColor('light', 'background', 800)?.toString();
      return (
        <Galeria.Image index={index} style={{ backgroundColor }}>
          <Image
            source={src(item)}
            recyclingKey={item + index}
            style={{ width, height }}
            contentFit={contentFit}
            alt={`Image ${index + 1}`}
            accessibilityLabel={`Image ${index + 1}`}
          />
        </Galeria.Image>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contentFit, width, height]
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
          data={imageURIs}
          keyExtractor={(item, index) => `image-${item}-${index}`}
          renderItem={renderItem}
          extraData={{ width, height }}
          initialScrollIndex={initialIndex}
          estimatedItemSize={width}
          estimatedListSize={{ height, width }}
          pagingEnabled
        />
      </Box>
    </Galeria>
  );
}

function src(uri: string) {
  return typeof uri === 'string' ? { uri } : uri;
}
