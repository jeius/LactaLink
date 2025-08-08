import { UserMarkerRef } from '@/components/map/markers/UserMarker';
import { createContext, useContext, useRef, useState } from 'react';
import MapView from 'react-native-maps';

type State = {
  followUser: boolean;
  isUserLocated: boolean;
  showAvatar: boolean;
  isMapLoaded: boolean;
  isMapReady: boolean;
  markersRendered: boolean;
  locateButtonPressed: boolean;
};

interface MapContextProps {
  mapRef: React.RefObject<MapView | null>;
  userMarkerRef: React.RefObject<UserMarkerRef | null>;
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
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
}

export function MapProvider({ children, mapRef: mapRefProp }: MapProviderProps) {
  const mapRef = useRef<MapView | null>(null);
  const userMarkerRef = useRef<UserMarkerRef>(null);

  const [state, setState] = useState<State>({
    followUser: false,
    showAvatar: true,
    isMapLoaded: false,
    isMapReady: false,
    markersRendered: false,
    locateButtonPressed: false,
    isUserLocated: false,
  });

  return (
    <MapContext.Provider value={{ mapRef: mapRefProp || mapRef, userMarkerRef, state, setState }}>
      {children}
    </MapContext.Provider>
  );
}
