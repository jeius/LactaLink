import { createContext, PropsWithChildren, RefObject, useContext, useState } from 'react';
import { type GoogleMapsViewRef } from 'react-native-google-maps-plus';
import { createStore, useStore, type StoreApi } from 'zustand';

export interface MapStore {
  mapRef: RefObject<GoogleMapsViewRef | null>;
  isFollowingUser: boolean;
  isUserLocated: boolean;
  createMapRef: (ref: GoogleMapsViewRef | null) => void;
  setFollowingUser: (following: boolean) => void;
  setUserLocated: (located: boolean) => void;
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
  const map = useMapStore((state) => state.mapRef.current);
  const createRef = useMapStore((state) => state.createMapRef);
  return [map, createRef] as const;
};

export const useIsFollowingUser = () => {
  const isFollowingUser = useMapStore((state) => state.isFollowingUser);
  const setFollowingUser = useMapStore((state) => state.setFollowingUser);
  return [isFollowingUser, setFollowingUser] as const;
};

export const useIsUserLocated = () => {
  const isUserLocated = useMapStore((state) => state.isUserLocated);
  const setUserLocated = useMapStore((state) => state.setUserLocated);
  return [isUserLocated, setUserLocated] as const;
};

interface MapProviderProps extends PropsWithChildren {
  mapRef: RefObject<GoogleMapsViewRef | null>;
}

export function MapProvider({ children, mapRef }: MapProviderProps) {
  const [mapStore] = useState(() =>
    createStore<MapStore>((set, get) => ({
      mapRef: mapRef,
      isFollowingUser: false,
      isUserLocated: false,
      createMapRef: (ref) => {
        const mapRef = get().mapRef;
        mapRef.current = ref;
      },
      setFollowingUser: (following) => set({ isFollowingUser: following }),
      setUserLocated: (located) => set({ isUserLocated: located }),
    }))
  );

  return <MapStoreContext.Provider value={mapStore}>{children}</MapStoreContext.Provider>;
}
