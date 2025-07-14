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

  const [{ x, y, z }, setData] = useState<MagnetometerMeasurement>({
    x: 0,
    y: 0,
    z: 0,
    timestamp: Date.now(),
  });

  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

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
        animatedHeading.value = getHeadingFromMagnetometer(res.x, res.y);
      });
      subscriptionRef.current = subscription;
    };

    setupSubscription();

    return () => {
      // Clean up the subscription when the component unmounts
      subscriptionRef.current?.remove();
    };
  }, []);

  return {
    x,
    y,
    z,
    setSlow: _slow,
    setFast: _fast,
    heading: getHeadingFromMagnetometer(x, y),
    animatedHeading,
  };
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

function getHeadingFromMagnetometer(x: number, y: number): number {
  if (x === 0 && y === 0) {
    return 0; // Return 0 if both x and y are zero to avoid undefined behavior
  }
  const heading = Math.atan2(y, x) * (180 / Math.PI);
  return heading >= 0 ? Math.round(heading) : Math.round(heading + 360);
}
