import { createAnimatedPressable } from 'pressto';
import React, { ComponentProps } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { AnimatedStyle, Easing, interpolate } from 'react-native-reanimated';

export interface PressableScaleProps extends ComponentProps<typeof PressableComp> {
  containerStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  disableRipple?: boolean;
}

const rippleColor = 'rgba(128,128,128,0.10)';

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

export function PressableScale({
  children,
  containerStyle,
  disableRipple = false,
  ...props
}: PressableScaleProps) {
  return (
    <PressableComp
      {...props}
      rippleColor={rippleColor}
      rippleRadius={disableRipple ? null : undefined}
      shouldCancelWhenOutside={props.shouldCancelWhenOutside ?? true}
      animationType="timing"
      animationConfig={{ duration: 250, easing: Easing.elastic(1.5) }}
      style={containerStyle}
    >
      {children}
    </PressableComp>
  );
}
