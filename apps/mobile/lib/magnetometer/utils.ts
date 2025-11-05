import { Magnetometer } from 'expo-sensors';
import { useEffect } from 'react';
import { type SharedValue } from 'react-native-reanimated';

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

export function useSetUpdateInterval(interval: MagnetometerOptions['updateInterval'] = 'slow') {
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

export function calculateHeading(x: number, y: number): number {
  if (x === 0 && y === 0) {
    return 0; // Return 0 if both x and y are zero to avoid undefined behavior
  }
  return Math.atan2(y, x) * (180 / Math.PI) - 90;
}

export function roundHeading(heading: number): number {
  return heading >= 0 ? Math.round(heading) : Math.round(heading + 360);
}

function slow() {
  return Magnetometer.setUpdateInterval(1000);
}
function fast() {
  return Magnetometer.setUpdateInterval(20);
}
