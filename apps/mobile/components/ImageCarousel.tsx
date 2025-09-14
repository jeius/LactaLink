import { getHexColor } from '@/lib/colors';
import { BLUR_HASH } from '@/lib/constants';
import { FileCollection } from '@lactalink/types/collections';
import { Image as ImageType } from '@lactalink/types/payload-generated-types';
import React, { useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, {
  CarouselRenderItem,
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import { useTheme } from './AppProvider/ThemeProvider';
import { Image } from './Image';
import { Box } from './ui/box';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

interface ImageCarouselProps<T extends FileCollection> {
  images: T[];
  carouselHeight?: number;
  carouselWidth?: number;
}
export function ImageCarousel<T extends FileCollection = FileCollection>({
  images,
  carouselHeight = 160,
  carouselWidth = 260,
}: ImageCarouselProps<T>) {
  const carouselRef = useRef<ICarouselInstance>(null);
  const { theme } = useTheme();

  const progress = useSharedValue<number>(0);

  const renderItem: CarouselRenderItem<ImageType> = ({ item }) => {
    const uri = item.sizes?.large?.url || item.url;
    const alt = item.alt || 'Image';

    return (
      <Box className="bg-background-200 h-full w-full">
        {uri ? (
          <Image
            alt={alt}
            source={{ uri }}
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
            placeholder={{ blurhash: BLUR_HASH }}
          />
        ) : (
          <Text size="xs" className="text-typography-700 m-auto text-center">
            No image available
          </Text>
        )}
      </Box>
    );
  };

  return (
    <VStack space="sm" className="items-center">
      <Box className="overflow-hidden rounded-lg">
        {images && images.length > 0 && (
          <Carousel
            ref={carouselRef}
            loop={images.length > 1}
            height={carouselHeight}
            width={carouselWidth}
            autoPlay
            autoPlayInterval={1000 * 5}
            data={images}
            renderItem={renderItem}
            onProgressChange={progress}
          />
        )}
      </Box>

      <Pagination.Basic
        progress={progress}
        data={images}
        dotStyle={{
          width: 6,
          height: 6,
          backgroundColor: getHexColor(theme, 'primary', 300),
          borderRadius: 3,
        }}
        activeDotStyle={{
          overflow: 'hidden',
          backgroundColor: getHexColor(theme, 'primary', 600),
        }}
        containerStyle={{
          gap: 8,
        }}
        horizontal
      />
    </VStack>
  );
}
