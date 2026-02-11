import { createContext, PropsWithChildren, RefObject, useContext, useState } from 'react';
import { type GoogleMapsViewRef } from 'react-native-google-maps-plus';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { createStore, useStore, type StoreApi } from 'zustand';

interface MapStore {
  map: RefObject<GoogleMapsViewRef | null>;
  isFollowingUser: boolean;
  isUserLocated: boolean;
  zoomLevel: SharedValue<number>;
  actions: {
    setMap: (ref: GoogleMapsViewRef | null) => void;
    setFollowingUser: (following: boolean) => void;
    setUserLocated: (located: boolean) => void;
    setZoomLevel: (zoom: number) => void;
  };
}

interface MapProviderProps extends PropsWithChildren {
  mapRef: RefObject<GoogleMapsViewRef | null>;
}

const MapStoreContext = createContext<StoreApi<MapStore> | null>(null);

function useMapStore<T>(selector: (state: MapStore) => T) {
  const store = useContext(MapStoreContext);
  if (!store) {
    throw new Error('useMapStore must be used within a MapProvider');
  }

  return useStore(store, selector);
}

export const useMap = () => {
  const map = useMapStore((state) => state.map.current);
  const setMap = useMapStore((state) => state.actions.setMap);
  return [map, setMap] as const;
};

export const useIsFollowingUser = () => {
  const isFollowingUser = useMapStore((state) => state.isFollowingUser);
  const setFollowingUser = useMapStore((state) => state.actions.setFollowingUser);
  return [isFollowingUser, setFollowingUser] as const;
};

export const useIsUserLocated = () => {
  const isUserLocated = useMapStore((state) => state.isUserLocated);
  const setUserLocated = useMapStore((state) => state.actions.setUserLocated);
  return [isUserLocated, setUserLocated] as const;
};

export const useMapZoomLevel = () => useMapStore((state) => state.zoomLevel);

export const useMapActions = () => useMapStore((state) => state.actions);

export function MapProvider({ children, mapRef }: MapProviderProps) {
  const zoomLevel = useSharedValue(0);

  const [mapStore] = useState(() =>
    createStore<MapStore>((set, get) => ({
      map: mapRef,
      isFollowingUser: false,
      isUserLocated: false,
      zoomLevel,
      actions: {
        setMap: (ref) => {
          get().map.current = ref;
        },
        setFollowingUser: (following) => set({ isFollowingUser: following }),
        setUserLocated: (located) => set({ isUserLocated: located }),
        setZoomLevel: (zoom) => {
          get().zoomLevel.value = zoom;
        },
      },
    }))
  );

  return <MapStoreContext.Provider value={mapStore}>{children}</MapStoreContext.Provider>;
}
