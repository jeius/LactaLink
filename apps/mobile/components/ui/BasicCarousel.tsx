import { Box } from '@/components/ui/box';
import { FlashList, FlashListProps, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { PropsWithChildren } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

type PickedFlashListProps<T> = Pick<
  FlashListProps<T>,
  'keyExtractor' | 'className' | 'contentContainerClassName' | 'contentContainerStyle' | 'style'
>;

/**
 * Configuration options for the AnimatedCarousel component
 */
export interface BasicCarouselConfig {
  /** Width of each item in pixels */
  itemWidth: number;
  /** Spacing between items in pixels */
  itemSpacing?: number;
  /** Scale range for non-focused items [min, focused, max] */
  scaleRange?: [number, number, number];
}

/**
 * Props for the AnimatedCarousel component
 */
export interface BasicCarouselProps<T> extends BasicCarouselConfig, PickedFlashListProps<T> {
  /** Array of data items to render */
  data: T[];
  /** Render function for each item */
  renderItem: (info: ListRenderItemInfo<T> & { isFocused: boolean }) => React.ReactElement | null;
}

/**
 * AnimatedCarousel - A horizontal scrolling carousel with scale animation
 *
 * This component provides a smooth horizontal scrolling experience with:
 * - Snap-to-position behavior for each item
 * - Scale animation that highlights the centered item
 * - Optimized performance using FlashList and React Native Reanimated
 *
 * @example
 * ```tsx
 * <AnimatedCarousel
 *   data={items}
 *   itemWidth={200}
 *   itemSpacing={16}
 *   scaleRange={[0.85, 1.1, 0.85]}
 *   renderItem={(item) => <YourItemComponent item={item} />}
 * />
 * ```
 */
export function BasicCarousel<T>({
  data,
  renderItem,
  keyExtractor,
  itemWidth,
  itemSpacing = 12,
  scaleRange = [0.9, 1.0, 0.9],
  ...props
}: BasicCarouselProps<T>) {
  const animatedRef = useAnimatedRef<FlashListRef<T>>();
  const scrollOffset = useScrollOffset(animatedRef);

  const itemSize = itemWidth + itemSpacing;

  return (
    <FlashList
      {...props}
      ref={animatedRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      snapToOffsets={data.map((_, i) => i * itemSize)}
      ItemSeparatorComponent={() => <Box style={{ width: itemSpacing }} />}
      decelerationRate="fast"
      scrollEventThrottle={16}
      renderItem={(info) => {
        const { index } = info;
        const isFocused = Math.round(scrollOffset.value / itemSize) === index;
        return (
          <ScaleIndicator
            index={index}
            scrollOffset={scrollOffset}
            itemSize={itemSize}
            scaleRange={scaleRange}
          >
            {renderItem({ ...info, isFocused })}
          </ScaleIndicator>
        );
      }}
    />
  );
}

/**
 * Props for the ScaleIndicator component
 */
interface ScaleIndicatorProps {
  /** Index of the item in the list */
  index: number;
  /** Shared value tracking the scroll offset */
  scrollOffset: SharedValue<number>;
  /** Total size of each item (width + spacing) */
  itemSize: number;
  /** Scale range for the animation [min, focused, max] */
  scaleRange: [number, number, number];
}

/**
 * ScaleIndicator - Wrapper component that applies scale animation to items
 *
 * This component calculates and applies scale transformation based on the item's
 * position relative to the scroll offset. The centered item receives the maximum
 * scale value, while items on either side are scaled down.
 *
 * @internal
 */
function ScaleIndicator({
  index,
  scrollOffset,
  itemSize,
  scaleRange,
  children,
}: PropsWithChildren<ScaleIndicatorProps>) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * itemSize, index * itemSize, (index + 1) * itemSize];

    const scale = interpolate(scrollOffset.value, inputRange, scaleRange, Extrapolation.CLAMP);

    return {
      transform: [{ scale }],
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
