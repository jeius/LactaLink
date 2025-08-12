import React, { useState } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';

export interface AnimatedPressableProps extends PressableProps {
  containerStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  disableAnimation?: boolean;
  disableRipple?: boolean;
}

export function AnimatedPressable({
  children,
  containerStyle,
  disableAnimation,
  disableRipple = false,
  ...props
}: AnimatedPressableProps) {
  const rippleColor = 'rgba(128,128,128,0.10)';

  const [pressableWidth, setPressableWidth] = useState(0);

  const scale = useSharedValue(1);

  const springConfig: WithSpringConfig = {
    damping: 15,
    stiffness: 200,
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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

  return disableAnimation ? (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={(event) => {
        props.onLayout?.(event);
        const { width } = event.nativeEvent.layout;
        setPressableWidth(width);
      }}
      android_ripple={
        disableRipple
          ? undefined
          : {
              color: rippleColor,
              radius: pressableWidth / 2 + 30,
              foreground: true,
            }
      }
    >
      {children}
    </Pressable>
  ) : (
    <Animated.View style={[animatedStyle, containerStyle]}>
      <Pressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLayout={(event) => {
          props.onLayout?.(event);
          const { width } = event.nativeEvent.layout;
          setPressableWidth(width);
        }}
        android_ripple={
          disableRipple
            ? undefined
            : {
                color: rippleColor,
                radius: pressableWidth / 2 + 30,
                foreground: true,
              }
        }
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
