import { LOCATION_UPDATES } from '@/lib/constants/taskNames';
import * as Location from 'expo-location';
import { getHexColor } from '../colors';

export async function startLocationUpdates() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Location permission not granted');
  }

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_UPDATES);

  if (hasStarted) {
    console.warn('Location updates already started');
    return;
  }

  const notificationColor = getHexColor('dark', 'background', '50');

  await Location.startLocationUpdatesAsync(LOCATION_UPDATES, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 5000, // Update every 5 seconds
    distanceInterval: 10, // Update on every 10 meters
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Location Updates',
      notificationBody: 'Tracking your location in the background',
      notificationColor: notificationColor?.toString() || '#272625',
    },
  });
}
