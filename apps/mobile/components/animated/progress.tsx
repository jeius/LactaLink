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
  base: 'bg-background-300 w-full rounded-full',
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
  value: targetProgress,
  duration = 500,
  orientation = 'horizontal',
  size = 'md',
  className,
  trackColor,
  hidden = false,
  ...props
}: AnimatedProgressTrackProps) {
  const animatedProgress = useSharedValue(0);
  const animatedOpacity = useSharedValue(1);

  const { themeColors } = useTheme();
  const defaultTrackColor = themeColors.primary[500];

  const isHorizontal = orientation === 'horizontal';

  useEffect(() => {
    animatedProgress.value = withTiming(targetProgress, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetProgress]);

  useEffect(() => {
    const opacity = hidden ? 0 : 1;
    animatedOpacity.value = withTiming(opacity, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: isHorizontal ? `${animatedProgress.value}%` : '100%',
    height: !isHorizontal ? `${animatedProgress.value}%` : '100%',
  }));

  const animatedOpacityStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value,
  }));

  return (
    <Animated.View style={[animatedOpacityStyle]}>
      <Box {...props} className={progressStyle({ size, orientation, class: className })}>
        <Animated.View
          style={[
            animatedStyle,
            {
              backgroundColor: trackColor || defaultTrackColor,
              borderRadius: 9999,
            },
          ]}
        />
      </Box>
    </Animated.View>
  );
}
