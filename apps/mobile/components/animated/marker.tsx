import { MapRegion } from '@lactalink/types';
import { MarkOptional } from '@lactalink/types/utils';
import { useCallback } from 'react';
import { MapMarker, MapMarkerProps } from 'react-native-maps';
import Animated, {
  Easing,
  EasingFunction,
  EasingFunctionFactory,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

type Region = MarkOptional<MapRegion, 'latitudeDelta' | 'longitudeDelta'>;

interface AnimateOptions extends Region {
  duration?: number;
  easing?: EasingFunction | EasingFunctionFactory;
}

export const useAnimatedRegion = (location: Partial<Region> = {}) => {
  const latitute = useSharedValue(location.latitude);
  const longitude = useSharedValue(location.longitude);
  const latitudeDelta = useSharedValue(location.latitudeDelta);
  const longitudeDelta = useSharedValue(location.longitudeDelta);

  const animatedProps = useAnimatedProps(() => ({
    coordinate: {
      latitude: latitute.value ?? 0,
      longitude: longitude.value ?? 0,
      latitudeDelta: latitudeDelta.value ?? 0,
      longitudeDelta: longitudeDelta.value ?? 0,
    },
  }));

  const animate = useCallback(
    (options: AnimateOptions) => {
      const { duration = 500, easing = Easing.inOut(Easing.ease) } = options;

      const animateValue = (value: SharedValue<number | undefined>, toValue?: number) => {
        if (!toValue) {
          return;
        }

        value.value = withTiming(toValue, {
          duration,
          easing,
        });
      };

      animateValue(latitute, options.latitude);
      animateValue(longitude, options.longitude);
      animateValue(latitudeDelta, options.latitudeDelta);
      animateValue(longitudeDelta, options.longitudeDelta);
    },
    [latitute, longitude, latitudeDelta, longitudeDelta]
  );

  return {
    props: animatedProps,
    animate,
  };
};

type MarkerProps = MarkOptional<MapMarkerProps, 'coordinate'>;

export const AnimatedMarker = Animated.createAnimatedComponent(
  MapMarker as React.ComponentClass<MarkerProps>
);
