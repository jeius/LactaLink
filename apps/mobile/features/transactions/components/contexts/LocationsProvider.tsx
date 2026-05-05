import { useCurrentCoordinates } from '@/lib/stores';
import { Coordinates } from '@lactalink/types';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';

interface LocationsStore {
  myLocation: Coordinates | null;
  otherPartyLocation: Coordinates | null;
  actions: {
    setMyLocation: (location: Coordinates) => void;
    setOtherPartyLocation: (location: Coordinates) => void;
  };
}

const Context = createContext<StoreApi<LocationsStore> | null>(null);

function useLocationsContext<T>(selector: (state: LocationsStore) => T) {
  const store = useContext(Context);
  if (!store) {
    throw new Error('useLocationsContext must be used within a LocationsProvider');
  }
  return useStore(store, useShallow(selector));
}

export function useMyLocation() {
  return useLocationsContext((s) => s.myLocation);
}

export function useOtherPartyLocation() {
  return useLocationsContext((s) => s.otherPartyLocation);
}

export default function LocationsProvider({
  otherPartyLocation,
  children,
}: PropsWithChildren<{ otherPartyLocation: Coordinates | null }>) {
  const [store] = useState(() =>
    createStore<LocationsStore>((set) => ({
      myLocation: null,
      otherPartyLocation: null,
      actions: {
        setMyLocation: (location) => set({ myLocation: location }),
        setOtherPartyLocation: (location) => set({ otherPartyLocation: location }),
      },
    }))
  );

  const currentCoords = useCurrentCoordinates();

  useEffect(() => {
    store.setState({ myLocation: currentCoords });
  }, [currentCoords, store]);

  useEffect(() => {
    store.setState({ otherPartyLocation });
  }, [otherPartyLocation, store]);

  return <Context.Provider value={store}>{children}</Context.Provider>;
}
