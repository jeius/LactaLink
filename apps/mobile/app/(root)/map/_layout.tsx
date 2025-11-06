import { useTheme } from '@/components/AppProvider/ThemeProvider';
import {
  DataMarkerProvider,
  useDataMarkersIndex,
  useSelectedDataMarker,
} from '@/components/contexts/DataMarkerProvider';
import MapView from '@/components/map/MapView';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { MapPageSearchParams } from '@/lib/types';
import { Tabs, useLocalSearchParams } from 'expo-router';
import { CompassIcon, MapIcon } from 'lucide-react-native';
import React, { PropsWithChildren, useMemo } from 'react';
import { RNMarker } from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EXTRA_MARKER_ID = 'info-marker';

function Map({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const { lat, lng, title } = useLocalSearchParams<MapPageSearchParams>();

  const infoMarkerCoords =
    lat && lng ? { latitude: Number(lat), longitude: Number(lng) } : undefined;
  const infoMarker: RNMarker | null = infoMarkerCoords
    ? {
        id: EXTRA_MARKER_ID,
        coordinate: infoMarkerCoords,
        title: title,
      }
    : null;

  const markersIndex = useDataMarkersIndex();
  const setSelectedMarker = useSelectedDataMarker()[1];

  const markers = useMemo(() => markersIndex.getAllItems(), [markersIndex]);

  // const [visibleMarkers, setVisibleMarkers] = useState<RNMarker[]>([]);
  // const updateVisibleMarkers = debounce(
  //   (region: RNRegion) => {
  //     const boundary = regionToBoundary(region);
  //     const newMarkers = markersIndex.searchByBoundary(boundary);
  //     setVisibleMarkers(newMarkers);
  //   },
  //   200,
  //   { leading: true, maxWait: 300 }
  // );

  function handleMarkerPress(markerID: string) {
    if (markerID === EXTRA_MARKER_ID) return;
    setSelectedMarker(markerID);
  }

  function unSelectMarker() {
    setSelectedMarker(null);
  }

  return (
    <MapView
      initialProps={
        infoMarkerCoords ? { camera: { center: infoMarkerCoords, zoom: 16 } } : undefined
      }
      // onCameraChange={updateVisibleMarkers}
      mapPadding={{ right: 4, left: 4, top: insets.top + 32 + 20, bottom: insets.bottom + 64 + 20 }}
      markers={infoMarker ? [...markers, infoMarker] : markers}
      onMarkerPress={handleMarkerPress}
      onMapPress={unSelectMarker}
    >
      {children}
    </MapView>
  );
}

export default function Layout() {
  const { themeColors } = useTheme();
  const { mrk: markerID } = useLocalSearchParams<MapPageSearchParams>();

  const tabBarActiveTintColor = themeColors.primary[500];
  const tabBarInactiveTintColor = themeColors.typography[900];
  const tabBarBackgroundColor = themeColors.background[0];
  const borderColor = themeColors.outline[600];

  return (
    <Box className="relative flex-1" style={{ backgroundColor: tabBarBackgroundColor }}>
      <DataMarkerProvider selectedMarkerId={markerID}>
        <Map>
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
        </Map>
      </DataMarkerProvider>
    </Box>
  );
}
