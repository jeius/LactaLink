import { createSubscription } from '@/lib/magnetometer/createMagnetometerSubscription';
import {
  calculateHeading,
  MagnetometerOptions,
  roundHeading,
  useSetUpdateInterval,
} from '@/lib/magnetometer/utils';
import { lerpAngle } from '@lactalink/utilities/geo-utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

export function useHeading({ updateInterval = 'fast', offset }: MagnetometerOptions = {}) {
  const prevReadingRef = useRef(0);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  const [heading, setHeading] = useState(0);

  useSetUpdateInterval(updateInterval);

  const filterHeading = useCallback((heading: number) => {
    return Math.round(lerpAngle(prevReadingRef.current, heading, 0.2));
  }, []);

  useEffect(() => {
    const setupSubscription = async () => {
      const subscription = await createSubscription((res) => {
        let raw = calculateHeading(res.x, res.y);
        if (offset) {
          raw = (raw - offset.value + 360) % 360;
        }
        const filtered = filterHeading(roundHeading(raw));
        prevReadingRef.current = filtered;

        setHeading((prev) => (prev !== filtered ? filtered : prev));
      });

      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = subscription;
      } else {
        subscriptionRef.current = subscription;
      }
    };

    setupSubscription();

    return () => {
      // Clean up the subscription when the component unmounts
      subscriptionRef.current?.remove();
    };
  }, [filterHeading, offset]);

  return heading;
}

export function useAnimatedHeading({ updateInterval = 'slow', offset }: MagnetometerOptions = {}) {
  const animatedHeading = useSharedValue(0);

  const prevReadingRef = useRef(0);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  useSetUpdateInterval(updateInterval);

  const filterHeading = useCallback((heading: number) => {
    return Math.round(lerpAngle(prevReadingRef.current, heading, 0.2));
  }, []);

  useEffect(() => {
    const setupSubscription = async () => {
      const subscription = await createSubscription((res) => {
        let raw = calculateHeading(res.x, res.y);
        if (offset) {
          raw = (raw - offset.value + 360) % 360;
        }
        const filtered = filterHeading(roundHeading(raw));
        prevReadingRef.current = filtered;
        animatedHeading.value = filtered;
      });

      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = subscription;
      } else {
        subscriptionRef.current = subscription;
      }
    };

    setupSubscription();

    return () => {
      // Clean up the subscription when the component unmounts
      subscriptionRef.current?.remove();
    };
  }, [animatedHeading, filterHeading, offset]);

  return animatedHeading;
}
