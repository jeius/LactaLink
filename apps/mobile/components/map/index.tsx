import { MapView } from '@/components/map/MapView';
import { Box } from '@/components/ui/box';

import { DataMarkers } from '@/components/map/markers/DataMarkers';
import { useMapStore } from '@/lib/stores/mapStore';
import { setSelectedMarker, useMarkersStore } from '@/lib/stores/markersStore';
import { MapMarkerProps } from '@/lib/types';
import { ColorsConfig } from '@/lib/types/colors';
import { MapRegion } from '@lactalink/types';
import { isDonation, isRequest, regionToBoundary } from '@lactalink/utilities';
import _ from 'lodash';
import React, { ComponentProps, memo, useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MemoizedMapView = memo(MapView, (prevProps, nextProps) => _.isEqual(prevProps, nextProps));
const MemoizedDataMarkers = memo(DataMarkers, (prevProps, nextProps) =>
  _.isEqual(prevProps, nextProps)
);

interface MapProps extends ComponentProps<typeof Box> {
  selectedMarkerID?: string;
}

export default function Map({ selectedMarkerID: markerID, ...props }: MapProps) {
  const insets = useSafeAreaInsets();

  const resetMap = useMapStore((s) => s.reset);

  const markerMap = useMarkersStore((s) => s.markerMap);
  const markersIndex = useMarkersStore((s) => s.markersIndex);

  const [visibleMarkers, setVisibleMarkers] = useState<MapMarkerProps[]>([]);

  const markers = useMemo(() => {
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
        <MemoizedDataMarkers
          key={`${markerProps.id}-${i}`}
          markerData={markerData}
          markerProps={markerProps}
          showAvatar={showAvatar}
          colorTheme={colorTheme}
        />
      );
    });
  }, [visibleMarkers, markerMap]);

  useEffect(() => {
    if (markerID) {
      setSelectedMarker(markerID);
    }
    return () => {
      resetMap();
    };
  }, [markerID, resetMap]);

  function handleRegionChange(data: MapRegion) {
    const newMarkers = markersIndex.searchByBoundary(regionToBoundary(data));
    if (newMarkers.length !== visibleMarkers.length) {
      setVisibleMarkers(newMarkers);
    }
  }

  function unSelectMarker() {
    setSelectedMarker(null);
  }

  return (
    <Box {...props} style={[props.style, { marginBottom: insets.bottom }]} pointerEvents="box-none">
      <MemoizedMapView onRegionChangeComplete={handleRegionChange} onPress={unSelectMarker}>
        {markers}
      </MemoizedMapView>
    </Box>
  );
}
