import { lerpAngle } from '@lactalink/utilities/geo-utils';
import { Magnetometer, MagnetometerMeasurement } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

export type MagnetometerOptions = {
  /**
   * Update interval for the magnetometer.
   * Can be 'slow' (1000ms), 'fast' (20ms), or a custom number in milliseconds.
   */
  updateInterval?: 'slow' | 'fast' | number;
};

export function useMagnetometer({ updateInterval = 'slow' }: MagnetometerOptions = {}) {
  const animatedHeading = useSharedValue(0);

  const prevReadingRef = useRef(0);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  const [{ x, y, z }, setData] = useState<MagnetometerMeasurement>({
    x: 0,
    y: 0,
    z: 0,
    timestamp: Date.now(),
  });

  const rawHeading = calculateHeading(x, y);
  const filteredHeading = filterHeading(rawHeading);

  const _slow = () => Magnetometer.setUpdateInterval(1000);
  const _fast = () => Magnetometer.setUpdateInterval(20);

  useEffect(() => {
    if (updateInterval === 'slow') {
      _slow();
    } else if (updateInterval === 'fast') {
      _fast();
    } else {
      Magnetometer.setUpdateInterval(updateInterval);
    }
  }, [updateInterval]);

  useEffect(() => {
    const setupSubscription = async () => {
      const subscription = await createSubscription((res) => {
        setData(res);
        const raw = calculateHeading(res.x, res.y);
        const filtered = filterHeading(raw);
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
    setSlow: _slow,
    setFast: _fast,
    heading: rawHeading,
    filteredHeading,
    animatedHeading,
  };

  function filterHeading(heading: number) {
    return Math.round(lerpAngle(prevReadingRef.current, heading, 0.2));
  }
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
  const heading = Math.atan2(y, x) * (180 / Math.PI) - 85; // Adjusted by -85 degrees for alignment
  const rounded = heading >= 0 ? Math.round(heading) : Math.round(heading + 360);
  return rounded;
}
