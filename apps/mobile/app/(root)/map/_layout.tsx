import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { MapView } from '@/components/map/MapView';
import { DataMarkers } from '@/components/map/markers/DataMarkers';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { useMapStore } from '@/lib/stores/mapStore';
import { setSelectedMarker, useMarkersStore } from '@/lib/stores/markersStore';
import { MapMarkerProps, MapPageSearchParams } from '@/lib/types';
import { ColorsConfig } from '@/lib/types/colors';
import { MapRegion } from '@lactalink/types';
import { regionToBoundary } from '@lactalink/utilities/geo-utils';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import { Tabs, useFocusEffect, useLocalSearchParams } from 'expo-router';
import isEqual from 'lodash/isEqual';
import { CompassIcon, MapIcon } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { MapMarker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MemoizedMapView = memo(MapView, (prevProps, nextProps) => isEqual(prevProps, nextProps));
const MemoizedDataMarkers = memo(DataMarkers, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps)
);

interface MapProps {
  style?: ViewProps['style'];
}

function Map({ style }: MapProps) {
  const insets = useSafeAreaInsets();
  const { mrk: markerID, lat, lng } = useLocalSearchParams<MapPageSearchParams>();

  const markerCoords = lat && lng ? { latitude: Number(lat), longitude: Number(lng) } : undefined;

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
  }, [markerID]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => resetMap(), []));

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
    <Box style={[style, { marginBottom: insets.bottom }]}>
      <MemoizedMapView
        safeInsets={insets}
        initialCamera={
          markerCoords
            ? {
                center: markerCoords,
                zoom: 16,
                pitch: 0,
                heading: 0,
              }
            : undefined
        }
        onRegionChangeComplete={handleRegionChange}
        onPress={unSelectMarker}
      >
        {markerCoords ? (
          <MapMarker identifier={`marker-${lat}-${lng}`} coordinate={markerCoords} />
        ) : (
          markers
        )}
      </MemoizedMapView>
    </Box>
  );
}

export default function Layout() {
  const { themeColors } = useTheme();
  const tabBarActiveTintColor = themeColors.primary[500];
  const tabBarInactiveTintColor = themeColors.typography[900];
  const tabBarBackgroundColor = themeColors.background[0];
  const borderColor = themeColors.outline[600];

  return (
    <Box className="relative flex-1">
      <Map style={StyleSheet.absoluteFill} />
      <Tabs
        initialRouteName="explore"
        screenOptions={{
          animation: 'shift',
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent', pointerEvents: 'box-none' },
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor,
          tabBarInactiveTintColor,
          tabBarStyle: { backgroundColor: tabBarBackgroundColor, elevation: 0, borderColor },
          tabBarLabelStyle: { fontSize: 12, fontFamily: 'Jakarta-SemiBold' },
          tabBarLabelPosition: 'beside-icon',
          //@ts-expect-error props.ref type mismatch
          tabBarButton: (props) => <Pressable {...props} ref={props.ref} />,
        }}
      >
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Icon as={CompassIcon} color={color} size="xl" />,
            tabBarLabel: 'Explore',
          }}
        />
        <Tabs.Screen
          name="directions"
          options={{
            title: 'Directions',
            tabBarIcon: ({ color }) => <Icon as={MapIcon} color={color} size="xl" />,
            tabBarLabel: 'Directions',
          }}
        />
      </Tabs>
    </Box>
  );
}
