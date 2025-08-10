import { UserMarkerRef } from '@/components/map/markers/UserMarker';
import { MarkerData } from '@/lib/stores/markersStore';
import { createContext, useContext, useRef, useState } from 'react';
import MapView from 'react-native-maps';

type State = {
  followUser: boolean;
  isUserLocated: boolean;
  showAvatar: boolean;
  isMapLoaded: boolean;
  isMapReady: boolean;
  renderMarkers: boolean;
  locateButtonPressed: boolean;
};

interface MapContextProps {
  mapRef: React.RefObject<MapView | null>;
  userMarkerRef: React.RefObject<UserMarkerRef | null>;
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  selectedMarker: MarkerData | null;
  setSelectedMarker: React.Dispatch<React.SetStateAction<MarkerData | null>>;
}

const MapContext = createContext<MapContextProps | null>(null);

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}

interface MapProviderProps extends React.PropsWithChildren {
  mapRef?: React.RefObject<MapView | null>;
  selectedMarker: MarkerData | null;
}

export function MapProvider({ children, mapRef: mapRefProp }: MapProviderProps) {
  const mapRef = useRef<MapView | null>(null);
  const userMarkerRef = useRef<UserMarkerRef>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  const [state, setState] = useState<State>({
    followUser: false,
    showAvatar: true,
    isMapLoaded: false,
    isMapReady: false,
    renderMarkers: false,
    locateButtonPressed: false,
    isUserLocated: false,
  });

  return (
    <MapContext.Provider
      value={{
        mapRef: mapRefProp || mapRef,
        userMarkerRef,
        state,
        setState,
        selectedMarker,
        setSelectedMarker,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}
