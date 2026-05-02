import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { useMarkersQuery } from '../../hooks/useMarkersQuery';
import { DataMarkerProviderProps, DataMarkerStore, MapQueryParams } from '../../lib/types';
import { createDataMarkerFromDoc } from '../../lib/utils/markerUtils';

const DataMarkerStoreContext = createContext<StoreApi<DataMarkerStore> | null>(null);

export function DataMarkerProvider({
  children,
  selectedMarkerID: selectedMarkerId,
}: DataMarkerProviderProps) {
  const [store] = useState(createMarkerStore);

  const { markers, markersMap, errors, isPending } = useMarkersQuery();

  useEffect(() => {
    if (!selectedMarkerId) {
      store.setState({ selectedDataMarker: null });
    } else {
      const { markersMap } = store.getState();
      const selectedDataMarker = markersMap.get(selectedMarkerId) || null;
      store.setState({ selectedDataMarker });
    }
  }, [selectedMarkerId, store]);

  useEffect(() => {
    if (errors.length > 0) {
      store.setState({ markers: [], markersMap: new Map(), selectedDataMarker: null });
      console.error('Error fetching markers:', errors);
    } else {
      store.setState({ markers, markersMap, isPending });
    }
  }, [errors, isPending, markers, markersMap, store]);

  return (
    <DataMarkerStoreContext.Provider value={store}>{children}</DataMarkerStoreContext.Provider>
  );
}

export const useMarkers = () => {
  const markers = useDataMarkerStore((state) => state.markers);
  const isPending = useDataMarkerStore((state) => state.isPending);
  return { markers, isPending };
};
export const useMarkersMap = () => useDataMarkerStore((state) => state.markersMap);
export const useMarkerActions = () => useDataMarkerStore((state) => state.actions);
export const useSelectedMarker = () => {
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
    isPending: false,
    actions: {
      setSelectedMarker: (markerID) => {
        const marker = markerID ? get().markersMap.get(markerID) || null : null;
        set({ selectedDataMarker: marker });
        const params: MapQueryParams = {
          mrk: markerID || undefined,
          lat: undefined,
          lng: undefined,
        };
        router.setParams(params);
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
        router.setParams({ mrk: undefined } as MapQueryParams);
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
