import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { MapView } from '@/components/map/MapView';
import { DataMarkers } from '@/components/map/markers/DataMarkers';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { getHexColor } from '@/lib/colors/getColor';
import { useMapStore } from '@/lib/stores/mapStore';
import { setSelectedMarker, useMarkersStore } from '@/lib/stores/markersStore';
import { MapMarkerProps, MapPageSearchParams } from '@/lib/types';
import { ColorsConfig } from '@/lib/types/colors';
import { MapRegion } from '@lactalink/types';
import { regionToBoundary } from '@lactalink/utilities/geo-utils';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import { Tabs, useLocalSearchParams } from 'expo-router';
import isEqual from 'lodash/isEqual';
import { CompassIcon, MapIcon } from 'lucide-react-native';
import React, { memo, useEffect, useMemo, useState } from 'react';
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
    <Box style={[style, { marginBottom: insets.bottom }]} pointerEvents="box-none">
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
        {markers}

        {markerCoords && (
          <MapMarker identifier={`marker-${lat}-${lng}`} coordinate={markerCoords} />
        )}
      </MemoizedMapView>
    </Box>
  );
}

export default function Layout() {
  const { theme } = useTheme();
  const tabBarActiveTintColor = getHexColor(theme, 'primary', 500)?.toString();
  const tabBarInactiveTintColor = getHexColor(theme, 'typography', 900)?.toString();
  const tabBarBackgroundColor = getHexColor(theme, 'background', 0)?.toString();
  const rippleColor = getHexColor(theme, 'background', 100)?.toString();
  const borderColor = getHexColor(theme, 'outline', 600)?.toString();

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
          tabBarButton: (props) => (
            <Pressable {...props} android_ripple={{ radius: 100, color: rippleColor }} />
          ),
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
