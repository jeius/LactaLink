import { DataMarkerProvider, useDataMarkers } from '@/components/contexts/markers/DataMarker';
import { MapView } from '@/components/map/MapView';
import { MapQueryParams } from '@/features/map/lib/types';
import { parseMarkerID } from '@/lib/utils/markerUtils';
import { parsePointString, pointToLatLng } from '@lactalink/utilities/geo-utils';
import { useIsFocused } from '@react-navigation/native';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { produce } from 'immer';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from 'react';
import { GoogleMapsViewRef, RNLatLng, RNMapPadding } from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Map({ children, ...queryParams }: PropsWithChildren<MapQueryParams>) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { mrk: markerID, lat, lng, start, dest } = queryParams;
  const isFocused = useIsFocused();

  const mapRef = useRef<GoogleMapsViewRef>(null);
  const markers = useDataMarkers();

  const mapPadding = useMemo<RNMapPadding>(
    () => ({ right: 4, left: 4, top: insets.top + 32 + 20, bottom: insets.bottom + 48 }),
    [insets.bottom, insets.top]
  );

  const handleMarkerPress = useCallback(
    (newMarkerID: string) => {
      if (newMarkerID === markerID) return; // Marker already selected, do nothing
      if (markerID) {
        // If there's an existing marker selected, hide its info window before selecting the new one
        mapRef.current?.hideMarkerInfoWindow(markerID);
        router.setParams({ mrk: undefined } as MapQueryParams);
        return;
      }
      router.setParams({ mrk: newMarkerID } as MapQueryParams);
    },
    [markerID, router]
  );

  const handleOnMapPress = useCallback((coords: RNLatLng) => {}, []);

  const handleOnInfoWindowClose = useCallback(
    () =>
      router.setParams({
        mrk: undefined,
      } as MapQueryParams),
    [router]
  );

  useEffect(() => {
    // Only attempt to move camera if screen is focused to prevent unwanted
    // camera movements when navigating back to the map screen
    if (!isFocused) return;

    function setCamera(coordinates: RNLatLng) {
      mapRef.current?.setCamera({ center: coordinates, zoom: 18 }, true, 500);
    }

    // If both start and dest are provided, fit the camera to show both points
    if (start && dest) {
      const startCoords = pointToLatLng(parsePointString(start));
      const destCoords = pointToLatLng(parsePointString(dest));

      if (startCoords && destCoords) {
        // Add extra padding to ensure markers aren't too close to edges
        const padding = produce(mapPadding, (draft) => {
          for (const [key, value] of Object.entries(mapPadding)) {
            draft[key as keyof RNMapPadding] = value + 40;
          }
        });

        mapRef.current?.setCameraToCoordinates([startCoords, destCoords], padding, true, 500);
      }
    }

    // If a markerID is provided, attempt to find the marker and show its info window
    else if (markerID) {
      const { coordinates } = parseMarkerID(markerID) ?? {};

      if (coordinates) {
        setCamera(coordinates);
        mapRef.current?.showMarkerInfoWindow(markerID);
      }
    }

    // If lat and lng are provided, move the camera to those coordinates
    else if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        setCamera({ latitude, longitude });
      }
    }
  }, [dest, isFocused, lat, lng, mapPadding, markerID, start]);

  return (
    <MapView
      mapRef={mapRef}
      mapPadding={mapPadding}
      markers={markers}
      onMarkerPress={handleMarkerPress}
      onMapPress={handleOnMapPress}
      onInfoWindowClose={handleOnInfoWindowClose}
    >
      {children}
    </MapView>
  );
}

function MapLayout({ children }: PropsWithChildren) {
  const params = useGlobalSearchParams<MapQueryParams>();

  return (
    <DataMarkerProvider selectedMarkerId={params.mrk}>
      <Map {...params}>{children}</Map>
    </DataMarkerProvider>
  );
}

export default MapLayout;
