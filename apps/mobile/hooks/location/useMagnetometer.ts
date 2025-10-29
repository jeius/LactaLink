import { lerpAngle } from '@lactalink/utilities/geo-utils';
import { Magnetometer, MagnetometerMeasurement } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

export type MagnetometerOptions = {
  /**
   * Update interval for the magnetometer.
   * Can be 'slow' (1000ms), 'fast' (20ms), or a custom number in milliseconds.
   */
  updateInterval?: 'slow' | 'fast' | number;
  /**
   * Optional offset to adjust the heading readings.
   */
  offset?: SharedValue<number>;
};

export function useMagnetometer({ updateInterval = 'slow', offset }: MagnetometerOptions = {}) {
  const animatedHeading = useSharedValue(0);

  const prevReadingRef = useRef(0);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  const [{ x, y, z }, setData] = useState<MagnetometerMeasurement>({
    x: 0,
    y: 0,
    z: 0,
    timestamp: Date.now(),
  });

  const rawHeading = roundHeading(calculateHeading(x, y));
  const filteredHeading = filterHeading(rawHeading);

  useSetUpdateInterval(updateInterval);

  useEffect(() => {
    const setupSubscription = async () => {
      const subscription = await createSubscription((res) => {
        setData(res);
        let raw = calculateHeading(res.x, res.y);
        if (offset) {
          raw = (raw - offset.value + 360) % 360;
        }
        const filtered = filterHeading(roundHeading(raw));
        prevReadingRef.current = filtered;
        animatedHeading.value = filtered;
      });
      subscriptionRef.current = subscription;
    };

    setupSubscription();

    return () => {
      // Clean up the subscription when the component unmounts
      subscriptionRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    x,
    y,
    z,
    setSlow: slow,
    setFast: fast,
    heading: rawHeading,
    filteredHeading,
    animatedHeading,
  };

  function filterHeading(heading: number) {
    return Math.round(lerpAngle(prevReadingRef.current, heading, 0.2));
  }
}

export function useAnimatedHeading({ updateInterval = 'slow', offset }: MagnetometerOptions = {}) {
  const animatedHeading = useSharedValue(0);

  const prevReadingRef = useRef(0);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  useSetUpdateInterval(updateInterval);

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
      subscriptionRef.current = subscription;
    };

    setupSubscription();

    return () => {
      // Clean up the subscription when the component unmounts
      subscriptionRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function filterHeading(heading: number) {
    return Math.round(lerpAngle(prevReadingRef.current, heading, 0.2));
  }

  return animatedHeading;
}

//#region Helpers
function useSetUpdateInterval(interval: MagnetometerOptions['updateInterval'] = 'slow') {
  useEffect(() => {
    if (interval === 'slow') {
      slow();
    } else if (interval === 'fast') {
      fast();
    } else {
      Magnetometer.setUpdateInterval(interval);
    }
  }, [interval]);
}

async function createSubscription(callback: (result: MagnetometerMeasurement) => void) {
  const isAvailable = await Magnetometer.isAvailableAsync();
  if (isAvailable) {
    const permission = await Magnetometer.requestPermissionsAsync();

    if (permission.granted) {
      return Magnetometer.addListener(callback);
    }
  }

  console.warn('Magnetometer is not available on this device.');
  return { remove: () => {} }; // Return a no-op remove function
}

function calculateHeading(x: number, y: number): number {
  if (x === 0 && y === 0) {
    return 0; // Return 0 if both x and y are zero to avoid undefined behavior
  }
  return Math.atan2(y, x) * (180 / Math.PI) - 85; // Adjusted by -85 degrees for alignment
}

function roundHeading(heading: number): number {
  return heading >= 0 ? Math.round(heading) : Math.round(heading + 360);
}

function slow() {
  return Magnetometer.setUpdateInterval(1000);
}
function fast() {
  return Magnetometer.setUpdateInterval(20);
}
//#endregion
