import React from 'react';
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
}

export function AnimatedPressable({
  children,
  containerStyle,
  disableAnimation,
  ...props
}: AnimatedPressableProps) {
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
    <Pressable {...props} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      {children}
    </Pressable>
  ) : (
    <Animated.View style={[animatedStyle, containerStyle]}>
      <Pressable {...props} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

// export interface AnimatedPressableProps {
//   children: React.ReactNode;
//   style?: StyleProp<ViewStyle>;
//   onPress?: () => void;
// }

// export function AnimatedPressable({
//   children,
//   onPress,
//   style: containerStyle,
// }: AnimatedPressableProps) {
//   const scale = useSharedValue(1);

//   const springConfig: WithSpringConfig = useMemo(
//     () => ({
//       damping: 15,
//       stiffness: 200,
//     }),
//     []
//   );

//   const tapGesture = useMemo(() => {
//     return Gesture.Tap()
//       .onBegin(() => {
//         // Scale down when the gesture begins
//         scale.value = withSpring(0.95, springConfig);
//       })
//       .onEnd(() => {
//         // Scale back up when the gesture ends
//         scale.value = withSpring(1, springConfig);

//         // Trigger the onPress callback
//         if (onPress) {
//           runOnJS(onPress)();
//         }
//       })
//       .onTouchesDown(() => {
//         // Scale back up when the gesture ends
//         scale.value = withSpring(0.95, springConfig);
//       })
//       .onTouchesCancelled(() => {
//         scale.value = withSpring(1, springConfig);
//       });
//   }, [scale, springConfig, onPress]);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   return (
//     <GestureDetector gesture={tapGesture}>
//       <Animated.View style={[animatedStyle, containerStyle]}>{children}</Animated.View>
//     </GestureDetector>
//   );
// }
