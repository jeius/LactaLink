import { LocationObject } from 'expo-location';
import { RNLatLng as LatLng } from 'react-native-google-maps-plus';
import { create } from 'zustand';

interface LocationStoreState {
  location: LocationObject | null;
  coordinates: LatLng | null;
}

export const useLocationStore = create<LocationStoreState>(() => ({
  location: null,
  coordinates: null,
}));

export function resetLocationStore() {
  useLocationStore.setState({ location: null, coordinates: null });
}

export function setLocationStore(location: LocationObject) {
  useLocationStore.setState({
    location,
    coordinates: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    },
  });
}

export function setCoordinatesStore(coordinates: LatLng) {
  useLocationStore.setState({ coordinates });
}

export const useCurrentLocation = () => useLocationStore((state) => state.location);
export const useCurrentCoordinates = () => useLocationStore((state) => state.coordinates);
export const getCurrentCoordinates = () => useLocationStore.getState().coordinates;
export const getCurrentLocation = () => useLocationStore.getState().location;
