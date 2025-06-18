import React, { useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';

export interface AnimatedPressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function AnimatedPressable({
  children,
  onPress,
  style: containerStyle,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const springConfig: WithSpringConfig = useMemo(
    () => ({
      damping: 15,
      stiffness: 200,
    }),
    []
  );

  const tapGesture = useMemo(() => {
    return Gesture.Tap()
      .onBegin(() => {
        // Scale down when the gesture begins
        scale.value = withSpring(0.95, springConfig);
      })
      .onEnd(() => {
        // Scale back up when the gesture ends
        scale.value = withSpring(1, springConfig);

        // Trigger the onPress callback
        if (onPress) {
          runOnJS(onPress)();
        }
      })
      .onTouchesDown(() => {
        // Scale back up when the gesture ends
        scale.value = withSpring(0.95, springConfig);
      })
      .onTouchesCancelled(() => {
        scale.value = withSpring(1, springConfig);
      });
  }, [scale, springConfig, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[animatedStyle, containerStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}
