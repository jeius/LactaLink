import { MapView } from '@/components/map/MapView';
import { MapQueryParams } from '@/features/map/lib/types';
import { parseMarkerID } from '@/lib/utils/markerUtils';
import { useIsFocused } from '@react-navigation/native';
import { useGlobalSearchParams } from 'expo-router';
import { produce } from 'immer';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GoogleMapsViewRef,
  RNLatLng,
  RNLocation,
  RNMapPadding,
  RNPolyline,
} from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spinner } from '@/components/ui/spinner';
import { isValidCoordinate } from '@lactalink/utilities/geolib';
import { useNavigationPolyline } from '../hooks/useNavigationPolyline';
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
  const alreadyFittedRef = useRef(false);

  const { markers, isPending: isPendingMarkers } = useMarkers();
  const [selectedMarker, setSelectedMarker] = useSelectedMarker();

  const { direction, isPending: isPendingDirection, isActive: isDirectionMode } = useDirection();

  const [locationUpdates, setLocationUpdates] = useState<RNLocation | null>(null);
  const { trimmedPolyline } = useNavigationPolyline(
    direction?.polyline,
    locationUpdates?.center,
    isDirectionMode
  );

  const selectedMarkerID = useMemo(
    () => selectedMarker?.marker.id ?? mrk,
    [mrk, selectedMarker?.marker.id]
  );
  const isLoading = isPendingMarkers || isPendingDirection;

  const routePolylines = useMemo<RNPolyline | null>(() => {
    if (!isDirectionMode || !trimmedPolyline || trimmedPolyline.length < 2) return null;

    const coordinates = locationUpdates?.center
      ? [locationUpdates.center, ...trimmedPolyline]
      : trimmedPolyline;

    return {
      id: 'directions-polyline',
      coordinates: coordinates,
      color: '#2563eb',
      width: 6,
      lineCap: 'round',
      lineJoin: 'round',
      zIndex: 99999,
    };
  }, [isDirectionMode, locationUpdates, trimmedPolyline]);

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

  const fitCameraToRoute = useCallback(() => {
    if (routePolylines) {
      hideMarkerInfoWindow();

      // Add extra padding to ensure markers aren't too close to edges
      const padding = produce(mapPadding, (draft) => {
        for (const [key, value] of Object.entries(mapPadding)) {
          draft[key as keyof RNMapPadding] = value + 40;
        }
      });

      if (!alreadyFittedRef.current) {
        mapRef.current?.setCameraToCoordinates(routePolylines.coordinates, padding, true, 500);
        alreadyFittedRef.current = true;
      }
    }
  }, [hideMarkerInfoWindow, mapPadding, routePolylines]);

  // When the selected marker changes, show its info window (or hide if null).
  useEffect(() => {
    // If there's a selected marker, show its info window.
    if (selectedMarkerID) showMarkerInfoWindow(selectedMarkerID);
    // If there's no selected marker, hide any open info window.
    else if (!selectedMarkerID) hideMarkerInfoWindow();
  }, [hideMarkerInfoWindow, selectedMarkerID, showMarkerInfoWindow]);

  // When exiting directions mode, reset the camera to the default position.
  useEffect(() => {
    if (!isDirectionMode) {
      alreadyFittedRef.current = false;
    }
  }, [isDirectionMode]);

  useEffect(() => {
    // Only attempt to move camera if screen is focused to prevent unwanted
    // camera movements when navigating back to the map screen
    if (!isFocused) return;

    function setCamera(coordinates: RNLatLng) {
      mapRef.current?.setCamera({ center: coordinates, zoom: 18 }, true, 500);
    }

    // If both start and dest are provided, fit the camera to show both points
    if (isDirectionMode) {
      fitCameraToRoute();
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
    fitCameraToRoute,
    hideMarkerInfoWindow,
    isDirectionMode,
    isFocused,
    lat,
    lng,
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
      onLocationUpdate={setLocationUpdates}
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
