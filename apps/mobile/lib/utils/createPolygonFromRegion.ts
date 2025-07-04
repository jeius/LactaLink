import { LatLng, Region } from 'react-native-maps';

export function createPolygonFromRegion(region: Region): LatLng[] {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

  const north = latitude + latitudeDelta / 2; // Northern boundary
  const south = latitude - latitudeDelta / 2; // Southern boundary
  const east = longitude + longitudeDelta / 2; // Eastern boundary
  const west = longitude - longitudeDelta / 2; // Western boundary

  return [
    { latitude: north, longitude: west }, // Northwest
    { latitude: north, longitude: east }, // Northeast
    { latitude: south, longitude: east }, // Southeast
    { latitude: south, longitude: west }, // Southwest
  ];
}
