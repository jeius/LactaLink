import { USER_MARKER_ID } from '@/lib/constants';
import { useCurrentCoordinates } from '@/lib/stores';
import { createMarkerId } from '@/lib/utils/markerUtils';
import { Coordinates } from '@lactalink/types';
import { Collection } from '@lactalink/types/collections';
import { createContext, useContext, useEffect, useState } from 'react';
import { createStore, useStore } from 'zustand';
import { useDirectionsQuery } from '../../hooks/useDirectionsQuery';
import { DataMarkerSlug } from '../../lib/types';
import {
  DirectionsContext,
  DirectionsContextProviderProps,
  DirectionsContextStore,
} from '../../lib/types/direction';

const Context = createContext<DirectionsContext | null>(null);

function useContextStore<T>(selector: (state: DirectionsContextStore) => T) {
  const store = useContext(Context);
  if (!store) {
    throw new Error('useDirectionsContextStore must be used within a DirectionsContextProvider');
  }
  return useStore(store, selector);
}

function useDirectionActions() {
  return useContextStore((s) => s.actions);
}

function useDirectionPending() {
  return useContextStore((s) => s.isPending);
}

function useDirectionError() {
  return useContextStore((s) => s.error);
}

function useDirectionOrigin() {
  return useContextStore((s) => s.origin);
}

function useDirectionDestination() {
  return useContextStore((s) => s.destination);
}

function useDirectionIsActive() {
  return useContextStore((s) => s.isActive);
}

function useDirectionTravelMode() {
  return useContextStore((s) => s.mode);
}

function useDirection() {
  const direction = useContextStore((s) => s.direction);
  const isPending = useDirectionPending();
  const error = useDirectionError();
  const isActive = useContextStore((s) => s.isActive);

  return { direction, isPending, error, isActive };
}

export function useStartNavigation<TSlug extends DataMarkerSlug>({
  destination,
  doc,
}: {
  destination:
    | {
        coordinates: Coordinates;
        name: string;
      }
    | null
    | undefined;
  doc: {
    relationTo: TSlug;
    value: Collection<TSlug>;
  };
}) {
  const currentCoords = useCurrentCoordinates();
  const { startNavigation, setInputs } = useDirectionActions();

  function handleShowDirections() {
    if (currentCoords && destination) {
      setInputs({
        origin: {
          coordinates: currentCoords,
          name: 'Your Location',
          markerID: USER_MARKER_ID,
        },
        destination: {
          coordinates: destination.coordinates,
          name: destination.name,
          markerID: createMarkerId({ ...doc, value: doc.value.id }, destination.coordinates),
        },
      });

      startNavigation();
    }
  }

  return handleShowDirections;
}

export function useStopNavigation() {
  const { stopNavigation } = useDirectionActions();
  return stopNavigation;
}

function Provider({ children }: DirectionsContextProviderProps) {
  const [store] = useState(
    createStore<DirectionsContextStore>((set, get) => ({
      direction: undefined,
      origin: null,
      destination: null,
      mode: 'DRIVE',
      isActive: false,
      isPending: false,
      isSuccess: false,
      error: null,
      actions: {
        setInputs: (inputs) => set(inputs),
        startNavigation: () => {
          const { origin, destination } = get();
          if (!origin || !destination) return;
          set({ isActive: true });
        },
        stopNavigation: () => {
          set({ origin: null, destination: null, direction: null, isActive: false });
        },
      },
    }))
  );

  const mode = useStore(store, (state) => state.mode);
  const isActive = useStore(store, (state) => state.isActive);
  const origin = useStore(store, (state) => state.origin);
  const destination = useStore(store, (state) => state.destination);

  const originCoords = origin?.coordinates;
  const destCoords = destination?.coordinates;

  const { data, error, isSuccess, isLoading } = useDirectionsQuery(
    { origin: originCoords, destination: destCoords, travelMode: mode },
    { enabled: isActive }
  );

  useEffect(() => {
    store.setState({ direction: data, error, isSuccess, isPending: isLoading });
  }, [data, error, isSuccess, isLoading, store]);

  return <Context.Provider value={store}>{children}</Context.Provider>;
}

export {
  Provider as DirectionsContextProvider,
  useDirection,
  useDirectionActions,
  useDirectionDestination,
  useDirectionError,
  useDirectionIsActive,
  useDirectionOrigin,
  useDirectionPending,
  useDirectionTravelMode,
};
