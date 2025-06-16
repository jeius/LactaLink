import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import React from 'react';
import { Dimensions, ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Box } from '../ui/box';

const skeletonStyle = tva({
  base: 'bg-background-300 overflow-hidden',
  variants: {
    height: {
      xs: 'h-2',
      sm: 'h-5',
      md: 'h-10',
      lg: 'h-20',
      xl: 'h-32',
      '2xl': 'h-40',
      '3xl': 'h-48',
      full: 'h-full',
    },
    width: {
      full: 'w-full',
      half: 'w-1/2',
      quarter: 'w-1/4',
      thirds: 'w-1/3',
      twoThirds: 'w-2/3',
    },
    rounded: {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      '4xl': 'rounded-4xl',
      full: 'rounded-full',
      none: 'rounded-none',
    },
  },
});

type SkeletonProps = ViewProps & VariantProps<typeof skeletonStyle>;

export default function ShimmerSkeleton({
  className,
  height = 'md',
  width: boxWidth = 'full',
  rounded = 'xl',
}: SkeletonProps) {
  const { width } = Dimensions.get('window');
  const translateX = useSharedValue(-width);

  React.useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width, { duration: 2200 }),
      -1, // Infinite repeat
      false // No reverse
    );
  }, [translateX, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Box className={skeletonStyle({ class: className, height, width: boxWidth, rounded })}>
      <Animated.View
        style={[
          {
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Shimmer color
            position: 'absolute',
            opacity: 0.4,
          },
          animatedStyle,
        ]}
      />
    </Box>
  );
}
