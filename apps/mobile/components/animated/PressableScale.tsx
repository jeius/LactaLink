import { RIPPLE_COLOR } from '@/lib/colors';
import { createAnimatedPressable } from 'pressto';
import React, { ComponentProps } from 'react';
import { Easing, interpolate } from 'react-native-reanimated';

export interface PressableScaleProps extends ComponentProps<typeof PressableComp> {
  disableRipple?: boolean;
}

const PressableComp = createAnimatedPressable((progress, { config }) => {
  'worklet';
  return {
    transform: [
      {
        scale: interpolate(progress, [0, 1], [config.baseScale, config.minScale]),
      },
    ],
  };
});

export function PressableScale({ children, disableRipple = false, ...props }: PressableScaleProps) {
  return (
    <PressableComp
      {...props}
      rippleColor={RIPPLE_COLOR}
      rippleRadius={disableRipple ? null : undefined}
      shouldCancelWhenOutside={props.shouldCancelWhenOutside ?? true}
      animationType="timing"
      animationConfig={{ duration: 250, easing: Easing.elastic(1.5) }}
    >
      {children}
    </PressableComp>
  );
}
