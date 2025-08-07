import React, { PropsWithChildren, useEffect } from 'react';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type RotatingViewProps = PropsWithChildren<{
  enable: boolean;
}>;

export function RotatingView({ enable: rotate, children }: RotatingViewProps) {
  const rotation = useSharedValue(0);
  const shouldStop = React.useRef(false);

  useEffect(() => {
    shouldStop.current = false;

    const animate = () => {
      rotation.value = withTiming(360, { duration: 1000 }, (finished) => {
        if (finished) {
          rotation.value = 0;
          if (rotate && !shouldStop.current) {
            runOnJS(animate)();
          }
        }
      });
    };

    if (rotate) {
      animate();
    } else {
      shouldStop.current = true;
      // If already at 0, no need to animate
      if (rotation.value !== 0) {
        // Let the current cycle finish, then stop
        // No further action needed, as animate() will not repeat
      } else {
        cancelAnimation(rotation);
        rotation.value = 0;
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value}deg`,
      },
    ],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
