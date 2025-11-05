import * as Location from 'expo-location';

export async function getCurrentPosition(
  options: Location.LocationOptions = { accuracy: Location.Accuracy.High, timeInterval: 1000 }
) {
  const { canAskAgain, granted } = await Location.getForegroundPermissionsAsync();

  if (!granted && !canAskAgain) {
    throw new Error('Location permission was permanently denied');
  }

  if (!granted && canAskAgain) {
    const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
    switch (newStatus) {
      case Location.PermissionStatus.DENIED:
        throw new Error('Location permission was denied');
      case Location.PermissionStatus.UNDETERMINED:
        throw new Error('Location permission is undetermined');
      default:
        break;
    }
  }

  console.log('🧭 Getting current location...');
  return Location.getCurrentPositionAsync(options);
}
