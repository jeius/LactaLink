import { MapView } from '@/components/map/MapView';
import { Box } from '@/components/ui/box';

import { MapBottomSheet } from '@/components/map/MapBottomSheet';

import { MapProvider } from '@/components/contexts/MapProvider';
import { DataMarkers } from '@/components/map/markers/DataMarkers';
import { useVisibleMarkers } from '@/hooks/collections/useVisibleMarkers';
import { DEFAULT_REGION } from '@/lib/constants';
import { useMarkersStore } from '@/lib/stores/markersStore';
import { MapPageSearchParams } from '@/lib/types';
import { ColorsConfig } from '@/lib/types/colors';
import { isDonation, isRequest } from '@lactalink/utilities';
import { useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import React, { memo, useMemo, useRef, useState } from 'react';
import RNMapView, { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MemoizedMapView = memo(MapView, (prevProps, nextProps) => _.isEqual(prevProps, nextProps));

export default function MapPage() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<RNMapView>(null);

  const { markerMap } = useMarkersStore();
  const { markerID } = useLocalSearchParams<MapPageSearchParams>();

  const selectedMarker = useMemo(() => {
    if (!markerID) return null;
    return markerMap.get(markerID) || null;
  }, [markerID, markerMap]);

  const [region, setRegion] = useState<Region>(DEFAULT_REGION);

  const { data: visibleMarkers, isLoading, isSuccess } = useVisibleMarkers(region);

  const markersReady = !isLoading && isSuccess;

  const markers = useMemo(() => {
    if (!markersReady) {
      return null;
    }

    return visibleMarkers.map((markerProps, i) => {
      const markerData = markerMap.get(markerProps.identifier);

      if (!markerData) return null;

      let colorTheme: keyof ColorsConfig['light'] | undefined;
      let showAvatar = false;

      if (isDonation(markerData.data)) {
        colorTheme = 'primary';
      } else if (isRequest(markerData.data)) {
        colorTheme = 'tertiary';
      } else {
        colorTheme = 'secondary';
        showAvatar = true;
      }

      return (
        <DataMarkers
          key={`${markerProps.id}-${i}`}
          markerData={markerData}
          markerProps={markerProps}
          showAvatar={showAvatar}
          colorTheme={colorTheme}
        />
      );
    });
  }, [markersReady, visibleMarkers, markerMap]);

  return (
    <MapProvider mapRef={mapRef} selectedMarker={selectedMarker}>
      <Box style={{ flex: 1, marginBottom: insets.bottom }}>
        <MemoizedMapView markersReady={markersReady} onRegionChangeComplete={setRegion}>
          {markers}
        </MemoizedMapView>

        <MapBottomSheet />
      </Box>
    </MapProvider>
  );
}
