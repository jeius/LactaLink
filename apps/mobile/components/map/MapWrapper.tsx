import React, { PropsWithChildren, useMemo, useState } from 'react';
import type { ViewProps } from 'react-native';
import { StyleSheet } from 'react-native';
import {
  GoogleMapsView,
  GoogleMapsViewRef,
  RNAndroidLocationPriority,
  RNIOSLocationAccuracy,
  RNMarker,
  RNMarkerSvg,
  type RNGoogleMapsPlusViewProps,
  type RNInitialProps,
  type RNLocation,
  type RNLocationConfig,
  type RNMapPadding,
  type RNMapUiSettings,
  type RNMapZoomConfig,
} from 'react-native-google-maps-plus';

import { useAnimatedLatLng } from '@/hooks/location/useAnimatedLatLng';
import { useHeading } from '@/hooks/location/useHeading';
import { useCurrentLocation } from '@/hooks/location/useLocation';
import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { USER_LOCATION_MARKER_SVG_STRING } from '@/lib/constants/markerSvgs';
import { callback } from 'react-native-nitro-modules';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Box } from '../ui/box';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';

type Props = ViewProps &
  RNGoogleMapsPlusViewProps &
  PropsWithChildren & {
    mapRef: React.RefObject<GoogleMapsViewRef | null>;
    hideUserLocationMarker?: boolean;
  };

const MAP_ZOOM_CONFIG: RNMapZoomConfig = { min: 0, max: 20 };

const LOCATION_CONFIG: RNLocationConfig = {
  android: {
    priority: RNAndroidLocationPriority.PRIORITY_HIGH_ACCURACY,
    interval: 3000,
    minUpdateInterval: 3000,
  },
  ios: {
    desiredAccuracy: RNIOSLocationAccuracy.ACCURACY_BEST,
    distanceFilterMeters: 10,
  },
};

const UI_SETTINGS: RNMapUiSettings = {
  allGesturesEnabled: true,
  compassEnabled: true,
  indoorLevelPickerEnabled: true,
  mapToolbarEnabled: false,
  myLocationButtonEnabled: false,
  rotateEnabled: true,
  scrollEnabled: true,
  scrollDuringRotateOrZoomEnabled: true,
  tiltEnabled: true,
  zoomControlsEnabled: false,
  zoomGesturesEnabled: true,
  consumeOnMarkerPress: false,
  consumeOnMyLocationButtonPress: false,
};

const USER_MARKER_ID = 'user-location-marker';

const DEFAULT_LOCATION: RNLocation = {
  center: PHILIPPINES_COORDINATES,
  altitude: 0,
  accuracy: 0,
  bearing: 0,
  speed: 0,
  time: 0,
};

const ICON_SVG: RNMarkerSvg = {
  width: 56,
  height: 56,
  svgString: USER_LOCATION_MARKER_SVG_STRING,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapCallback<T extends (...args: any[]) => void>(
  propCallback: T | undefined,
  fallback?: (...args: Parameters<T>) => void
) {
  return callback({
    f: ((...args: Parameters<T>) => {
      propCallback?.(...args);
      fallback?.(...args);
    }) as T,
  });
}

export default function MapWrapper(props: Props) {
  const { children, hideUserLocationMarker = false, ...rest } = props;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const mapPadding: RNMapPadding = useMemo(() => {
    return props.children
      ? { top: insets.top + 20, left: 20, bottom: insets.bottom + 20, right: 20 }
      : { top: insets.top + 20, left: 20, bottom: insets.bottom + 20, right: 20 };
  }, [insets.bottom, insets.top, props.children]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const { location: currentLoc } = useCurrentLocation();
  const heading = useHeading({ updateInterval: 'fast' });

  const initialLoc: RNLocation = useMemo(() => {
    if (!currentLoc?.coords) return DEFAULT_LOCATION;
    return {
      center: {
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      },
      altitude: currentLoc.coords.altitude || 0,
      accuracy: currentLoc.coords.accuracy || 0,
      bearing: currentLoc.coords.heading || 0,
      speed: currentLoc.coords.speed || 0,
      time: currentLoc.timestamp || 0,
    };
  }, [currentLoc]);

  const initialProps = useMemo<RNInitialProps>(
    () => ({
      camera: {
        center: initialLoc.center,
        zoom: 16,
      },
    }),
    [initialLoc.center]
  );

  const { animateTo, animatedLatLng } = useAnimatedLatLng(initialLoc.center);

  const userLocationMarker = useMemo<RNMarker | null>(() => {
    if (hideUserLocationMarker) return null;
    return {
      id: USER_MARKER_ID,
      coordinate: animatedLatLng,
      rotation: heading,
      flat: true,
      anchor: { x: 0.5, y: 0.5 },
      iconSvg: ICON_SVG,
      zIndex: -1,
    };
  }, [hideUserLocationMarker, animatedLatLng, heading]);

  const markers = useMemo<RNMarker[] | undefined>(() => {
    return userLocationMarker ? [userLocationMarker, ...(props.markers || [])] : props.markers;
  }, [props.markers, userLocationMarker]);

  return (
    <Box className="flex-1">
      <GoogleMapsView
        {...rest}
        hybridRef={wrapCallback((ref) => (props.mapRef.current = ref))}
        initialProps={props.initialProps ?? initialProps}
        markers={markers}
        uiSettings={props.uiSettings ?? UI_SETTINGS}
        myLocationEnabled={props.myLocationEnabled ?? false}
        trafficEnabled={props.trafficEnabled ?? false}
        indoorEnabled={props.indoorEnabled ?? false}
        style={[StyleSheet.absoluteFill, props.style]}
        userInterfaceStyle={props.userInterfaceStyle ?? theme}
        mapType={props.mapType ?? 'normal'}
        mapZoomConfig={props.mapZoomConfig ?? MAP_ZOOM_CONFIG}
        mapPadding={props.mapPadding ?? mapPadding}
        locationConfig={props.locationConfig ?? LOCATION_CONFIG}
        onMapPress={wrapCallback(props.onMapPress)}
        onMapLongPress={wrapCallback(props.onMapLongPress)}
        onPoiPress={wrapCallback(props.onPoiPress)}
        onMarkerPress={wrapCallback(props.onMarkerPress)}
        onPolylinePress={wrapCallback(props.onPolylinePress)}
        onPolygonPress={wrapCallback(props.onPolygonPress)}
        onCirclePress={wrapCallback(props.onCirclePress)}
        onMarkerDragStart={wrapCallback(props.onMarkerDragStart)}
        onMarkerDrag={wrapCallback(props.onMarkerDrag)}
        onMarkerDragEnd={wrapCallback(props.onMarkerDragEnd)}
        onIndoorBuildingFocused={wrapCallback(props.onIndoorBuildingFocused)}
        onIndoorLevelActivated={wrapCallback(props.onIndoorLevelActivated)}
        onInfoWindowPress={wrapCallback(props.onInfoWindowPress)}
        onInfoWindowClose={wrapCallback(props.onInfoWindowClose)}
        onInfoWindowLongPress={wrapCallback(props.onInfoWindowLongPress)}
        onMyLocationPress={wrapCallback(props.onMyLocationPress)}
        onMyLocationButtonPress={wrapCallback(props.onMyLocationButtonPress)}
        onCameraChangeStart={wrapCallback(props.onCameraChangeStart)}
        onCameraChange={wrapCallback(props.onCameraChange)}
        onCameraChangeComplete={wrapCallback(props.onCameraChangeComplete)}
        onMapReady={wrapCallback(props.onMapReady)}
        onMapLoaded={wrapCallback(props.onMapLoaded, () => setMapLoaded(true))}
        onMapError={wrapCallback(props.onMapError, (e) => console.warn('Map error:', e))}
        onLocationUpdate={wrapCallback(props.onLocationUpdate, ({ center }) => animateTo(center))}
        onLocationError={wrapCallback(props.onLocationError, (e) =>
          console.warn('Location error:', e)
        )}
      />

      {children}

      {!mapLoaded && (
        <Box className="absolute inset-0 flex-col items-center justify-center gap-1 bg-primary-0">
          <Spinner size={'large'} />
          <Text size="md">Loading google maps...</Text>
        </Box>
      )}
    </Box>
  );
}
