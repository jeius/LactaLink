import { DataMarkerProvider, useDataMarkers } from '@/components/contexts/markers/DataMarker';
import { MapView } from '@/components/map/MapView';
import { MapQueryParams } from '@/features/map/lib/types';
import { parseMarkerID } from '@/lib/utils/markerUtils';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { GoogleMapsViewRef, RNLatLng } from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Map({ children, ...queryParams }: PropsWithChildren<MapQueryParams>) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { mrk: markerID, lat, lng } = queryParams;

  const mapRef = useRef<GoogleMapsViewRef>(null);
  const prevMarkerIDRef = useRef<string | undefined>(markerID);
  const markers = useDataMarkers();

  const handleMarkerPress = useCallback(
    (markerID: string) => router.setParams({ mrk: markerID } as MapQueryParams),
    [router]
  );

  const handleOnMapPress = useCallback(
    (_coords: RNLatLng) =>
      router.setParams({
        mrk: undefined,
        list: undefined,
        lat: undefined,
        lng: undefined,
      } as MapQueryParams),
    [router]
  );

  useEffect(() => {
    if (markerID) {
      const { coordinates } = parseMarkerID(markerID) ?? {};

      if (coordinates) {
        mapRef.current?.setCamera({ center: coordinates, zoom: 18 }, true, 300);
      }
    } else if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        mapRef.current?.setCamera({ center: { latitude, longitude }, zoom: 18 }, true, 500);
      }
    }

    const prevMarkerID = prevMarkerIDRef.current;
    if (!markerID && prevMarkerID) {
      mapRef.current?.hideMarkerInfoWindow(prevMarkerID);
    }
    prevMarkerIDRef.current = markerID;
  }, [lat, lng, markerID]);

  return (
    <MapView
      mapRef={mapRef}
      mapPadding={{ right: 4, left: 4, top: insets.top + 32 + 20, bottom: insets.bottom + 48 }}
      markers={markers}
      onMarkerPress={handleMarkerPress}
      onMapPress={handleOnMapPress}
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
