import { LOCATION_UPDATES } from '@/lib/constants/taskNames';
import * as Location from 'expo-location';
import { getHexColor } from '../colors';

export async function startBackgroundLocationUpdates() {
  const { status } = await Location.requestBackgroundPermissionsAsync();

  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Background location updates not permitted.');
  }

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_UPDATES);

  if (hasStarted) {
    console.warn('Background location updates already started');
    return;
  }

  const notificationColor = getHexColor('dark', 'background', '50');

  await Location.startLocationUpdatesAsync(LOCATION_UPDATES, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 5000, // Update every 5 seconds
    distanceInterval: 10, // Update on every 10 meters
    showsBackgroundLocationIndicator: false,
    foregroundService: {
      notificationTitle: 'Location Updates',
      notificationBody: 'Tracking your location in the background',
      notificationColor: notificationColor?.toString() || '#272625',
    },
    deferredUpdatesDistance: 10, // Update every 10 meters
    deferredUpdatesInterval: 5000, // Update every 5 seconds
    deferredUpdatesTimeout: 60000, // Timeout after 60 seconds
  });
}

export async function startForgroundLocationUpdates(
  callback: Location.LocationCallback,
  errorCallback?: Location.LocationErrorCallback
) {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.granted) {
    return Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update on every 10 meters
        mayShowUserSettingsDialog: true,
      },
      callback,
      errorCallback
    );
  }

  console.warn('Location permissions not granted for foreground updates');
  return { remove: () => {} }; // Return a no-op remove function
}
