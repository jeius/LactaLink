import { LocationObject } from 'expo-location';
import { RNLocation } from 'react-native-google-maps-plus';

/**
 * Transforms a React Native Google Maps Plus location object to an Expo LocationObject.
 * @param location - The `RNLocation` object to transform.
 * @returns A `LocationObject` compatible with Expo Location API.
 */
export function transformRNLocationToExpo(location: RNLocation): LocationObject {
  return {
    mocked: false,
    timestamp: location.time,
    coords: {
      accuracy: location.accuracy,
      altitude: location.altitude,
      heading: location.bearing,
      latitude: location.center.latitude,
      longitude: location.center.longitude,
      speed: location.speed,
      altitudeAccuracy: null,
    },
  };
}

/**
 * Transforms an Expo LocationObject to a React Native Google Maps Plus location object.
 * @param location - The `LocationObject` from Expo Location API to transform.
 * @returns A `RNLocation` object compatible with React Native Google Maps Plus.
 */
export function transformExpoLocationToRN(location: LocationObject): RNLocation {
  return {
    center: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    },
    altitude: location.coords.altitude ?? 0,
    accuracy: location.coords.accuracy ?? 0,
    bearing: location.coords.heading ?? 0,
    speed: location.coords.speed ?? 0,
    time: location.timestamp,
    android: {
      isMock: location.mocked,
      verticalAccuracyMeters: location.coords.altitudeAccuracy ?? undefined,
    },
    ios: {
      verticalAccuracy: location.coords.altitudeAccuracy ?? undefined,
      isFromMockProvider: location.mocked,
      timestamp: location.timestamp,
    },
  };
}
