import { LocationObject } from 'expo-location';
import { LatLng } from 'react-native-maps';
import { create } from 'zustand';

interface LocationStoreState {
  location: LocationObject | null;
  coordinates: LatLng | null;
  setLocation: (location: LocationObject | null) => void;
  setCoordinates: (coordinates: LatLng | null) => void;
  reset: () => void;
}

export const useLocationStore = create<LocationStoreState>((set) => ({
  location: null,
  coordinates: null,
  setLocation: (location: LocationObject | null) => set({ location }),
  setCoordinates: (coordinates: LatLng | null) => set({ coordinates }),
  reset: () => set({ location: null, coordinates: null }),
}));

export function getLocationCoordinates(location: LocationObject | null): LatLng | null {
  if (!location || !location.coords) return null;
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}
