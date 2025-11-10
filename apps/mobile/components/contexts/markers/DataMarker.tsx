import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import { ErrorSearchParams } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { DataMarkerProviderProps, DataMarkerStore } from './types';
import { createDataMarkerFromDoc, initializeMarkers } from './utils';

const DataMarkerStoreContext = createContext<StoreApi<DataMarkerStore> | null>(null);

export function DataMarkerProvider({ children, selectedMarkerId }: DataMarkerProviderProps) {
  const [store] = useState(createMarkerStore);

  const { data, error } = useQuery({
    queryKey: QUERY_KEYS.MARKERS,
    queryFn: () => initializeMarkers(store.getState().markersMap),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (data) {
      const { selectedDataMarker: prev } = store.getState();

      const { markers, map } = data;

      let selectedDataMarker =
        typeof selectedMarkerId === 'string' ? map.get(selectedMarkerId) : selectedMarkerId;

      if (prev && selectedDataMarker === undefined) {
        // Retain the previous selected marker reference if no new selection is provided
        selectedDataMarker = prev;
      } else if (prev?.data.value.id === selectedDataMarker?.data.value.id) {
        // Retain the previous selected marker reference if the same marker is selected
        selectedDataMarker = prev;
      }

      store.setState({ markersMap: map, selectedDataMarker, markers });
    }
  }, [data, selectedMarkerId, store]);

  if (error) {
    const params: ErrorSearchParams = {
      title: 'Markers Failed',
      message: extractErrorMessage(error),
      action: 'go-back',
    };
    return <Redirect withAnchor href={{ pathname: '/error', params }} />;
  }

  return (
    <DataMarkerStoreContext.Provider value={store}>{children}</DataMarkerStoreContext.Provider>
  );
}

export const useDataMarkers = () => useDataMarkerStore((state) => state.markers);
export const useDataMarkersMap = () => useDataMarkerStore((state) => state.markersMap);
export const useDataMarkerActions = () => useDataMarkerStore((state) => state.actions);
export const useSelectedDataMarker = () => {
  const value = useDataMarkerStore((state) => state.selectedDataMarker);
  const setValue = useDataMarkerStore((state) => state.actions.setSelectedMarker);
  return [value, setValue] as const;
};
export const useResetDataMarkers = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKERS, exact: true });
  };
};

//#region Helpers
function useDataMarkerStore<T>(selector: (state: DataMarkerStore) => T) {
  const store = useContext(DataMarkerStoreContext);
  if (!store) {
    throw new Error('useDataMarkerStore must be used within a DataMarkerProvider');
  }
  return useStore(store, selector);
}

function createMarkerStore() {
  return createStore<DataMarkerStore>((set, get) => ({
    markersMap: new Map(),
    selectedDataMarker: null,
    markers: [],
    actions: {
      setSelectedMarker: (markerID) => {
        const marker = markerID ? get().markersMap.get(markerID) || null : null;
        set({ selectedDataMarker: marker });
      },

      removeMarker: (markerID) => {
        const { markersMap: markerMap } = get();
        const marker = markerMap.get(markerID);
        if (marker) {
          const newMap = new Map(markerMap);
          const deleted = newMap.delete(markerID);
          if (!deleted) return;
          const newMarkers = Array.from(newMap.values()).map((dm) => dm.marker);
          set({ markers: newMarkers, markersMap: newMap });
        }
      },

      addMarker: (doc) => {
        const { markersMap: markerMap } = get();
        const newMap = new Map(markerMap);
        const dataMarker = createDataMarkerFromDoc(doc);

        if (Array.isArray(dataMarker)) {
          dataMarker.forEach((dm) => {
            newMap.set(dm.marker.id, dm);
          });
        } else if (dataMarker) {
          newMap.set(dataMarker.marker.id, dataMarker);
        }

        const newMarkers = Array.from(newMap.values()).map((dm) => dm.marker);
        set({ markers: newMarkers, markersMap: newMap });

        return dataMarker;
      },
    },
  }));
}
//#endregion
