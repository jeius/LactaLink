import { Magnetometer, MagnetometerMeasurement } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

export type MagnetometerOptions = {
  /**
   * Update interval for the magnetometer.
   * Can be 'slow' (1000ms), 'fast' (20ms), or a custom number in milliseconds.
   */
  updateInterval?: 'slow' | 'fast' | number;
};

export function useMagnetometer({ updateInterval = 'slow' }: MagnetometerOptions = {}) {
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
      const subscription = await createSubscription(setData);
      subscriptionRef.current = subscription;
    };

    setupSubscription();

    return () => {
      // Clean up the subscription when the component unmounts
      subscriptionRef.current?.remove();
    };
  }, []);

  return { x, y, z, setSlow: _slow, setFast: _fast, heading: getHeadingFromMagnetometer(x, y) };
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
  const heading = parseFloat((Math.atan2(y, x) * (180 / Math.PI)).toFixed(4));
  return heading < 0 ? heading + 360 : heading;
}
