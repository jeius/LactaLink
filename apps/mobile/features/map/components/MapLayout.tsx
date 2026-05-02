import { MapView } from '@/components/map/MapView';
import { useIsFocused } from '@react-navigation/native';
import { useGlobalSearchParams } from 'expo-router';
import debounce from 'lodash/debounce';
import { PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import {
  GoogleMapsViewRef,
  RNCamera,
  RNLatLng,
  RNMapPadding,
  RNPolyline,
  RNRegion,
} from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DirectionsContextProvider, {
  useDirection,
} from '@/features/directions/components/DirectionsProvider';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useMapNavigation } from '../hooks/useMapNavigation';
import { useMarkerCamera } from '../hooks/useMarkerCamera';
import { useMarkerInfoWindow } from '../hooks/useMarkerInfoWindow';
import { useNavigationPolyline } from '../hooks/useNavigationPolyline';
import { BoundarySchema, MapQueryParams } from '../lib/types';
import { createDirectionsPolyline } from '../lib/utils/markerUtils';
import { DataMarkerProvider, useMarkers, useSelectedMarker } from './contexts/markers';
import MapSpinner from './MapSpinner';

function Map({
  children,
  onCameraChangeComplete,
  ...queryParams
}: PropsWithChildren<
  MapQueryParams & {
    onCameraChangeComplete?: (region: RNRegion, camera: RNCamera, isGesture: boolean) => void;
  }
>) {
  const insets = useSafeAreaInsets();

  const mapPadding = useMemo<RNMapPadding>(
    () => ({ right: 4, left: 4, top: insets.top + 120, bottom: insets.bottom + 48 }),
    [insets.bottom, insets.top]
  );

  const { mrk, lat, lng, dest, start } = queryParams;
  const isFocused = useIsFocused();
  const mapRef = useRef<GoogleMapsViewRef>(null);

  const { markers } = useMarkers();
  const [selectedMarker, setSelectedMarker] = useSelectedMarker();
  const { direction, isPending: isLoadingDirections, isActive: isDirectionMode } = useDirection();

  const { locationUpdates, handleLocationUpdate } = useLocationTracking();
  const { trimmedPolyline, snappedPosition, isOffRoute } = useNavigationPolyline(
    direction?.polyline,
    locationUpdates?.center,
    isDirectionMode
  );

  const selectedMarkerID = useMemo(
    () => selectedMarker?.marker.id ?? mrk,
    [mrk, selectedMarker?.marker.id]
  );

  const routePolylines = useMemo(() => {
    if (!isDirectionMode || !trimmedPolyline || trimmedPolyline.length < 2) return null;
    const coordinates = snappedPosition ? [snappedPosition, ...trimmedPolyline] : trimmedPolyline;
    return createDirectionsPolyline(coordinates);
  }, [isDirectionMode, snappedPosition, trimmedPolyline]);

  const { hideMarkerInfoWindow } = useMarkerInfoWindow(mapRef, selectedMarkerID);

  useMapNavigation({
    mapRef,
    isOffRoute,
    isDirectionMode,
    locationUpdates,
    routePolylines,
    isLoadingDirections,
    start,
    dest,
    mapPadding,
    hideMarkerInfoWindow,
  });

  useMarkerCamera({ mapRef, isFocused, isDirectionMode, selectedMarkerID, lat, lng });

  const handleOnMapPress = useCallback((_coords: RNLatLng) => {}, []);
  const handleOnInfoWindowClose = useCallback(() => setSelectedMarker(null), [setSelectedMarker]);
  const handleMarkerPress = useCallback(
    (newMarkerID: string) => {
      if (isDirectionMode) return; // Don't allow selecting markers while in directions mode
      if (newMarkerID === selectedMarkerID) return; // Marker already selected, do nothing
      if (selectedMarkerID) {
        // If there's an existing marker selected, hide its info window before selecting the new one
        mapRef.current?.hideMarkerInfoWindow(selectedMarkerID);
      }
      setSelectedMarker(newMarkerID);
    },
    [isDirectionMode, selectedMarkerID, setSelectedMarker]
  );

  return (
    <MapView
      mapRef={mapRef}
      mapPadding={mapPadding}
      markers={markers}
      onMarkerPress={handleMarkerPress}
      onMapPress={handleOnMapPress}
      onInfoWindowClose={handleOnInfoWindowClose}
      polylines={[routePolylines].filter(Boolean) as RNPolyline[]}
      uiSettings={{ consumeOnMarkerPress: isDirectionMode }}
      onLocationUpdate={handleLocationUpdate}
      onCameraChangeComplete={onCameraChangeComplete}
      onMapLoaded={(region, camera) => onCameraChangeComplete?.(region, camera, false)}
    >
      {children}
      {!isDirectionMode && (
        <MapSpinner
          className="absolute"
          style={{ top: mapPadding.top + 8, right: mapPadding.right + 8 }}
        />
      )}
    </MapView>
  );
}

function MapLayout({ children }: PropsWithChildren) {
  const params = useGlobalSearchParams<MapQueryParams>();
  const [boundary, setBoundary] = useState<BoundarySchema | null>(null);
  const debouncedSetBoundary = useMemo(() => debounce(setBoundary, 100, { trailing: true }), []);

  return (
    <DataMarkerProvider selectedMarkerID={params.mrk} boundary={boundary}>
      <DirectionsContextProvider>
        <Map
          {...params}
          onCameraChangeComplete={(region) => {
            const { latLngBounds } = region;
            debouncedSetBoundary({
              swLat: latLngBounds.southwest.latitude,
              swLng: latLngBounds.southwest.longitude,
              neLat: latLngBounds.northeast.latitude,
              neLng: latLngBounds.northeast.longitude,
            });
          }}
        >
          {children}
        </Map>
      </DirectionsContextProvider>
    </DataMarkerProvider>
  );
}

export default MapLayout;
