import React from 'react';
import { GestureResponderEvent, PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Pressable } from '../ui/pressable';

export function AnimatedPressable({ children, onPressIn, onPressOut, ...props }: PressableProps) {
  const scale = useSharedValue(1);

  const handlePressIn = (e: GestureResponderEvent) => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 200,
    });
    if (onPressIn) {
      onPressIn(e);
    }
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
    if (onPressOut) {
      onPressOut(e);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable {...props} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
