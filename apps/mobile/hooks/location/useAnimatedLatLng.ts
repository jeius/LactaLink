import { useCallback, useState } from 'react';
import { type RNLatLng } from 'react-native-google-maps-plus';
import {
  Easing,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  type WithTimingConfig,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export function useAnimatedLatLng(initialLatLng: RNLatLng) {
  const animatedLat = useSharedValue(initialLatLng.latitude);
  const animatedLng = useSharedValue(initialLatLng.longitude);

  const [latlng, setLatLng] = useState<RNLatLng>(initialLatLng);

  const animateTo = useCallback(
    (
      latlng: RNLatLng,
      config: WithTimingConfig = { easing: Easing.inOut(Easing.ease), duration: 300 }
    ) => {
      const animateValue = (sharedValue: SharedValue<number>, toValue: number) => {
        if (!toValue) return;
        sharedValue.value = withTiming(toValue, config);
      };

      animateValue(animatedLat, latlng.latitude);
      animateValue(animatedLng, latlng.longitude);
    },
    [animatedLat, animatedLng]
  );

  useAnimatedReaction(
    () => ({
      latitude: animatedLat.value,
      longitude: animatedLng.value,
    }),
    (current, prev) => {
      if (current.latitude !== prev?.latitude || current.longitude !== prev.longitude) {
        scheduleOnRN(setLatLng, current);
      }
    },
    []
  );

  return { animatedLatLng: latlng, animateTo };
}
