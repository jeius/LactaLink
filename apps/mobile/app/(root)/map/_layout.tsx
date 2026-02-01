import { useTheme } from '@/components/AppProvider/ThemeProvider';
import {
  DataMarkerProvider,
  useDataMarkers,
  useSelectedDataMarker,
} from '@/components/contexts/markers/DataMarker';
import MapView from '@/components/map/MapView';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { MapPageSearchParams } from '@/lib/types';
import { destructureMarkerID } from '@/lib/utils/markerUtils';
import { Tabs, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { CompassIcon, MapIcon } from 'lucide-react-native';
import React, { PropsWithChildren } from 'react';
import { RNLatLng } from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Map({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathName = usePathname();

  const isAddressInfoPage = pathName.includes('address');
  const isMarkerInfoPage = pathName.includes('marker');

  const markers = useDataMarkers();
  const [selectedMarker] = useSelectedDataMarker();

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
    // Do nothing if the selected marker is already the pressed marker
    if (selectedMarker?.marker.id === markerID) return;

    // Determine the type of marker and navigate accordingly
    const { slug, id } = destructureMarkerID(markerID);

    // Navigate to the appropriate page based on marker type
    // For addresses, go to address info page
    if (slug === 'addresses') {
      // Push if not already on an info page, else replace
      if (!isAddressInfoPage && !isMarkerInfoPage) {
        router.push(`/map/explore/address/${id}`);
      } else if (isMarkerInfoPage) {
        router.replace(`/map/explore/address/${id}`, { withAnchor: true });
      }
      // For other data markers, go to generic marker info page
    } else {
      // Push if not already on an info page, else replace
      if (isAddressInfoPage || isMarkerInfoPage) {
        router.replace(`/map/explore/marker/${markerID}`, { withAnchor: true });
      } else {
        router.push(`/map/explore/marker/${markerID}`);
      }
    }
  }

  function handleOnMapPress(_coords: RNLatLng) {
    // If on an info page, go back to the explore page
    if (isAddressInfoPage || isMarkerInfoPage) {
      router.back();
    }
  }

  return (
    <MapView
      // onCameraChange={updateVisibleMarkers}
      mapPadding={{ right: 4, left: 4, top: insets.top + 32 + 20, bottom: insets.bottom + 64 + 20 }}
      markers={markers}
      onMarkerPress={handleMarkerPress}
      onMapPress={handleOnMapPress}
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
              tabBarLabelStyle: { fontSize: 14, fontFamily: 'Jakarta-Bold' },
              tabBarLabelPosition: 'beside-icon',
              tabBarButton: (props) => (
                //@ts-expect-error props.ref type mismatch
                <Pressable {...props} android_ripple={undefined} ref={props.ref} />
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
        </Map>
      </DataMarkerProvider>
    </Box>
  );
}
