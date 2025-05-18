import React, { ReactNode, useEffect, useState } from 'react';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export default function AnimatedWrapper({
  children,
  visible,
  onClose, // called after exit animation completes
}: {
  children: ReactNode;
  visible: boolean;
  onClose?: () => void;
}) {
  const animatedX = useSharedValue(-60);
  const animatedOpacity = useSharedValue(0);
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      animatedOpacity.value = withTiming(1, { duration: 300 });
      animatedX.value = withSpring(0);
    } else {
      animatedOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
          if (onClose) runOnJS(onClose)();
        }
      });
      animatedX.value = withSpring(-60);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: animatedX.value }],
    opacity: animatedOpacity.value,
  }));

  if (!shouldRender) return null;

  return <Animated.View style={[animatedStyle]}>{children}</Animated.View>;
}
