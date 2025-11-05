import { Magnetometer, type MagnetometerMeasurement } from 'expo-sensors';

export async function createSubscription(callback: (result: MagnetometerMeasurement) => void) {
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
