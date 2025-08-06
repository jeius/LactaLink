import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { ComponentProps, FC } from 'react';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';

interface BottomSheetActionButtonProps extends ComponentProps<typeof Button> {
  icon?: LucideIcon | FC<LucideProps>;
  label?: string;
  scrollValue?: SharedValue<number>;
  animateDistance?: number;
}

export function BottomSheetActionButton({
  label,
  icon,
  scrollValue,
  animateDistance = 100,
  ...props
}: BottomSheetActionButtonProps) {
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    const delta = scrollValue?.value ?? 0;
    // Only animate if delta is more than 50 (positive or negative)
    const shouldAnimate = Math.abs(delta) >= 50;

    // Clamp delta for interpolation
    const clampedDelta = Math.max(-animateDistance, Math.min(delta, animateDistance));

    // Animate translateY and opacity with timing
    const translateY = withTiming(
      shouldAnimate
        ? interpolate(clampedDelta, [-animateDistance, 0, animateDistance], [0, 0, animateDistance])
        : 0,
      { duration: 250 }
    );
    const opacity = withTiming(
      shouldAnimate
        ? interpolate(clampedDelta, [-animateDistance, 0, animateDistance], [1, 1, 0])
        : 1,
      { duration: 250 }
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        animatedStyle,
      ]}
    >
      <Box
        className="bg-background-0 border-outline-200 rounded-2xl border p-4"
        style={{ paddingBottom: insets.bottom }}
      >
        <Button {...props}>
          {icon && <ButtonIcon as={icon} />}
          <ButtonText>{label}</ButtonText>
        </Button>
      </Box>
    </Animated.View>
  );
}
