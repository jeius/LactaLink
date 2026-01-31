import React, { ComponentProps } from 'react';
import { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  AnimatedStyle,
  Easing,
  isSharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  WithTimingConfig,
} from 'react-native-reanimated';
import { Pressable } from '../ui/pressable';

const AnimatedUIPressable = Animated.createAnimatedComponent(Pressable);

export interface AnimatedPressableProps extends ComponentProps<typeof AnimatedUIPressable> {
  containerStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  disablePressAnimation?: boolean;
  disableRipple?: boolean;
  minScale?: number;
}

const rippleColor = 'rgba(128,128,128,0.10)';

const timingConfig: WithTimingConfig = {
  duration: 250,
  easing: Easing.elastic(1.5),
};

export function AnimatedPressable({
  children,
  containerStyle,
  disablePressAnimation = false,
  disableRipple = false,
  minScale = 0.98,
  ...props
}: AnimatedPressableProps) {
  const progress = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withTiming(progress.value ? minScale : 1, timingConfig);
    return { transform: [{ scale: scale }] };
  });

  function handlePressIn(event: GestureResponderEvent) {
    if (!disablePressAnimation) progress.value = true;

    if (typeof props.onPressIn === 'function') props.onPressIn?.(event);
    else if (props.onPressIn) props.onPressIn.value?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    if (!disablePressAnimation) progress.value = false;

    if (typeof props.onPressOut === 'function') props.onPressOut?.(event);
    else if (props.onPressOut) props.onPressOut.value?.(event);
  }

  return (
    <AnimatedUIPressable
      {...props}
      key={
        isSharedValue(props.key)
          ? (props.key.value as React.Key | undefined)
          : (props.key as React.Key | undefined)
      }
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, containerStyle, props.style]}
      android_ripple={
        disableRipple
          ? undefined
          : {
              color: rippleColor,
              foreground: true,
            }
      }
    >
      {children}
    </AnimatedUIPressable>
  );
}
