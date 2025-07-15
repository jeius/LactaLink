import { ArrowUpIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Icon } from './ui/icon';

interface CompassProps {
  heading?: number;
}

export function Compass({ heading = 0 }: CompassProps) {
  const animatedHeading = useSharedValue(heading);

  useEffect(() => {
    animatedHeading.value = withTiming(heading, {
      duration: 300,
    });
  }, [animatedHeading, heading]);

  const rotationStyle = useAnimatedStyle(
    () => ({
      transform: [{ rotate: `${-animatedHeading.value}deg` }],
    }),
    [animatedHeading]
  );

  return (
    <Animated.View style={[rotationStyle]}>
      <Icon as={ArrowUpIcon} size="xl" />
    </Animated.View>
  );
}
