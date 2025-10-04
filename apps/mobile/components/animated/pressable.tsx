import React from 'react';
import { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import { Pressable, PressableProps } from '../ui/pressable';

export interface AnimatedPressableProps extends PressableProps {
  containerStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  disablePressAnimation?: boolean;
  disableRipple?: boolean;
}

const rippleColor = 'rgba(128,128,128,0.10)';

const AnimatedUIPressable = Animated.createAnimatedComponent(Pressable);

const springConfig: WithSpringConfig = {
  damping: 60,
  stiffness: 600,
};

export function AnimatedPressable({
  children,
  containerStyle,
  disablePressAnimation = false,
  disableRipple = false,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    if (disablePressAnimation) return {};
    return { transform: [{ scale: scale.value }] };
  });

  function handlePressIn(event: GestureResponderEvent) {
    // Scale down when the gesture begins
    scale.value = withSpring(0.95, springConfig);
    props.onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    // Scale back up when the gesture ends
    scale.value = withSpring(1, springConfig);
    props.onPressOut?.(event);
  }

  return (
    <AnimatedUIPressable
      {...props}
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
