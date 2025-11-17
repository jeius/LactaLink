import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { VariantProps } from '@gluestack-ui/nativewind-utils/types';
import React, { ComponentProps, useEffect } from 'react';
import { ColorValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Box } from '../ui/box';

const progressStyle = tva({
  base: 'w-full rounded-full bg-background-300',
  variants: {
    orientation: {
      horizontal: 'w-full',
      vertical: 'h-full',
    },
    size: {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
      xl: 'h-5',
      '2xl': 'h-6',
    },
  },
  compoundVariants: [
    {
      orientation: 'vertical',
      size: 'xs',
      class: 'h-full w-1 justify-end',
    },
    {
      orientation: 'vertical',
      size: 'sm',
      class: 'h-full w-2 justify-end',
    },
    {
      orientation: 'vertical',
      size: 'md',
      class: 'h-full w-3 justify-end',
    },
    {
      orientation: 'vertical',
      size: 'lg',
      class: 'h-full w-4 justify-end',
    },

    {
      orientation: 'vertical',
      size: 'xl',
      class: 'h-full w-5 justify-end',
    },
    {
      orientation: 'vertical',
      size: '2xl',
      class: 'h-full w-6 justify-end',
    },
  ],
});

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface AnimatedProgressTrackProps
  extends VariantProps<typeof progressStyle>,
    ComponentProps<typeof Box> {
  /**
   * The value of the progress bar (0 to 100).
   */
  value: number;
  /**
   * The duration of the animation in milliseconds. Default is 500ms.
   */
  duration?: number;
  className?: string;
  /**
   * The color of the progress track. Defaults to the theme's primary color.
   */
  trackColor?: ColorValue;
  /**
   * If true, the progress bar will be hidden with a fade-out animation.
   */
  hidden?: boolean;
}

export function AnimatedProgress({
  value,
  duration = 500,
  orientation = 'horizontal',
  size = 'md',
  className,
  trackColor,
  hidden = false,
  ...props
}: AnimatedProgressTrackProps) {
  const { themeColors } = useTheme();
  const defaultTrackColor = themeColors.primary[500];

  const isHorizontal = orientation === 'horizontal';
  const progress = useSharedValue(value);

  useEffect(() => {
    progress.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) });
  }, [value, progress, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: isHorizontal ? `${progress.value}%` : '100%',
    height: !isHorizontal ? `${progress.value}%` : '100%',
  }));

  const animatedOpacityStyle = useAnimatedStyle(() => {
    const opacity = withTiming(hidden ? 0 : 1, { duration, easing: Easing.out(Easing.cubic) });
    return { opacity };
  }, [hidden]);

  return (
    <AnimatedBox
      {...props}
      style={[animatedOpacityStyle]}
      className={progressStyle({ size, orientation, class: className })}
    >
      <Animated.View
        className="rounded-full"
        style={[animatedStyle, { backgroundColor: trackColor || defaultTrackColor }]}
      />
    </AnimatedBox>
  );
}
