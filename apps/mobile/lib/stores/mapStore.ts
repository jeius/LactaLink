import { UserMarkerRef } from '@/components/map/markers/UserMarker';
import { Animated } from 'react-native';
import MapView from 'react-native-maps';
import { create } from 'zustand';

export interface MapStoreState {
  followUser: boolean;
  isUserLocated: boolean;
  locateUser: boolean;
  map: MapView | null;
  userMarker: UserMarkerRef | null;
  setMapRef: (ref: MapView | Animated.LegacyRef<MapView> | null) => void;
  setUserMarkerRef: (marker: UserMarkerRef | null) => void;
  setFollowUser: (follow: boolean) => void;
  setUserLocated: (isLocated: boolean) => void;
  setLocateUser: (locate: boolean) => void;
  reset: () => void;
}

export const useMapStore = create<MapStoreState>((set) => ({
  followUser: false,
  isUserLocated: false,
  locateUser: false,
  isMapLoaded: false,
  isMapReady: false,
  map: null,
  userMarker: null,
  setMapRef: (ref) => {
    if (ref instanceof MapView || ref === null) {
      set({ map: ref });
    }
  },
  setUserMarkerRef: (marker) => set({ userMarker: marker }),
  setFollowUser: (follow) => set({ followUser: follow }),
  setUserLocated: (isLocated) => set({ isUserLocated: isLocated }),
  setLocateUser: (locate) => set({ locateUser: locate }),
  reset: () =>
    set({
      followUser: false,
      isUserLocated: false,
      locateUser: false,
      map: null,
    }),
}));
