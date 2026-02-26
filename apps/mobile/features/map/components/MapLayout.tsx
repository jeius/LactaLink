import { MapView } from '@/components/map/MapView';
import { MapQueryParams } from '@/features/map/lib/types';
import { parseMarkerID } from '@/lib/utils/markerUtils';
import { useIsFocused } from '@react-navigation/native';
import { useGlobalSearchParams } from 'expo-router';
import { produce } from 'immer';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  GoogleMapsViewRef,
  RNLatLng,
  RNMapPadding,
  RNPolyline,
} from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spinner } from '@/components/ui/spinner';
import { isValidCoordinate } from '@lactalink/utilities/geolib';
import { DirectionsContextProvider, useDirection } from './contexts/directions';
import { DataMarkerProvider, useMarkers, useSelectedMarker } from './contexts/markers';

function Map({ children, ...queryParams }: PropsWithChildren<MapQueryParams>) {
  const insets = useSafeAreaInsets();

  const mapPadding = useMemo<RNMapPadding>(
    () => ({ right: 4, left: 4, top: insets.top + 32 + 20, bottom: insets.bottom + 48 }),
    [insets.bottom, insets.top]
  );

  const { mrk, lat, lng } = queryParams;
  const isFocused = useIsFocused();

  const mapRef = useRef<GoogleMapsViewRef>(null);
  const prevMarkerIDRef = useRef<string>(null);

  const { markers, isPending: isPendingMarkers } = useMarkers();
  const [selectedMarker, setSelectedMarker] = useSelectedMarker();
  const { direction, isPending: isPendingDirection, isActive: isDirectionMode } = useDirection();

  const selectedMarkerID = useMemo(
    () => selectedMarker?.marker.id ?? mrk,
    [mrk, selectedMarker?.marker.id]
  );
  const isLoading = isPendingMarkers || isPendingDirection;

  const routePolylines = useMemo<RNPolyline | null>(() => {
    if (!direction || !isDirectionMode) return null;
    return {
      id: 'directions-polyline',
      coordinates: direction.polyline,
      color: '#2563eb',
      width: 6,
      lineCap: 'round',
      lineJoin: 'round',
      zIndex: 99999,
    };
  }, [direction, isDirectionMode]);

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

  const handleOnMapPress = useCallback((coords: RNLatLng) => {}, []);

  const handleOnInfoWindowClose = useCallback(() => setSelectedMarker(null), [setSelectedMarker]);

  const showMarkerInfoWindow = useCallback((id: string) => {
    mapRef.current?.showMarkerInfoWindow(id);
    prevMarkerIDRef.current = id;
  }, []);

  const hideMarkerInfoWindow = useCallback(() => {
    if (prevMarkerIDRef.current) {
      mapRef.current?.hideMarkerInfoWindow(prevMarkerIDRef.current);
      prevMarkerIDRef.current = null;
    }
  }, []);

  useEffect(() => {
    // If there's a selected marker, show its info window.
    if (selectedMarkerID) showMarkerInfoWindow(selectedMarkerID);
    // If there's no selected marker, hide any open info window.
    else if (!selectedMarkerID) hideMarkerInfoWindow();
  }, [hideMarkerInfoWindow, selectedMarkerID, showMarkerInfoWindow]);

  useEffect(() => {
    // Only attempt to move camera if screen is focused to prevent unwanted
    // camera movements when navigating back to the map screen
    if (!isFocused) return;

    function setCamera(coordinates: RNLatLng) {
      mapRef.current?.setCamera({ center: coordinates, zoom: 18 }, true, 500);
    }

    // If both start and dest are provided, fit the camera to show both points
    if (routePolylines && isDirectionMode) {
      // Add extra padding to ensure markers aren't too close to edges
      const padding = produce(mapPadding, (draft) => {
        for (const [key, value] of Object.entries(mapPadding)) {
          draft[key as keyof RNMapPadding] = value + 40;
        }
      });

      mapRef.current?.setCameraToCoordinates(routePolylines.coordinates, padding, true, 500);
      hideMarkerInfoWindow();
    }
    // If a markerID is provided, attempt to find the marker and show its info window
    else if (selectedMarkerID) {
      const { coordinates } = parseMarkerID(selectedMarkerID) ?? {};

      if (coordinates) {
        setCamera(coordinates);
        mapRef.current?.showMarkerInfoWindow(selectedMarkerID);
      }
    }
    // If lat and lng are provided, move the camera to those coordinates
    else if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (isValidCoordinate({ latitude, longitude })) {
        setCamera({ latitude, longitude });
      }
    }
  }, [
    hideMarkerInfoWindow,
    isDirectionMode,
    isFocused,
    lat,
    lng,
    mapPadding,
    routePolylines,
    selectedMarkerID,
  ]);

  return (
    <MapView
      mapRef={mapRef}
      mapPadding={mapPadding}
      markers={markers}
      onMarkerPress={handleMarkerPress}
      onMapPress={handleOnMapPress}
      onInfoWindowClose={handleOnInfoWindowClose}
      polylines={[routePolylines].filter(Boolean) as RNPolyline[]}
      uiSettings={{
        consumeOnMarkerPress: isDirectionMode,
      }}
    >
      {children}
      {isLoading && (
        <Spinner
          size={'small'}
          className="absolute"
          style={{ top: mapPadding.top + 8, right: mapPadding.right + 8 }}
        />
      )}
    </MapView>
  );
}

function MapWrapper({ children }: PropsWithChildren) {
  const params = useGlobalSearchParams<MapQueryParams>();

  return (
    <DataMarkerProvider selectedMarkerID={params.mrk}>
      <DirectionsContextProvider>
        <Map {...params}>{children}</Map>
      </DirectionsContextProvider>
    </DataMarkerProvider>
  );
}

export { MapWrapper as MapLayout };

export default MapWrapper;
