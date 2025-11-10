import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ViewProps } from 'react-native';
import { StyleSheet } from 'react-native';
import {
  GoogleMapsView,
  GoogleMapsViewRef,
  RNAndroidLocationPriority,
  type RNCamera,
  type RNGoogleMapsPlusViewProps,
  type RNInitialProps,
  RNIOSLocationAccuracy,
  type RNLocation,
  type RNLocationConfig,
  type RNMapPadding,
  type RNMapUiSettings,
  type RNMapZoomConfig,
  type RNMarker,
  type RNMarkerSvg,
  type RNRegion,
} from 'react-native-google-maps-plus';

import { useAnimatedLatLng } from '@/hooks/location/useAnimatedLatLng';
import { useHeading } from '@/hooks/location/useHeading';
import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { USER_LOCATION_MARKER_SVG_STRING } from '@/lib/constants/markerSvgs';
import { getCurrentLocation, setLocationStore } from '@/lib/stores';
import {
  transformExpoLocationToRN,
  transformRNLocationToExpo,
} from '@/lib/utils/transformLocationData';
import { arePointsEqual, latLngToPoint } from '@lactalink/utilities/geo-utils';
import { callback } from 'react-native-nitro-modules';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../AppProvider/ThemeProvider';
import { MapProvider, useIsFollowingUser, useMap, useMapActions } from '../contexts/MapProvider';
import { Box } from '../ui/box';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';

type Props = Pick<ViewProps, 'style'> &
  RNGoogleMapsPlusViewProps &
  PropsWithChildren & {
    hideUserLocationMarker?: boolean;
    offset?: EdgeInsets;
    containerStyle?: ViewProps['style'];
    containerClassName?: ViewProps['className'];
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

function MapView({
  children,
  hideUserLocationMarker = false,
  offset,
  containerClassName,
  containerStyle,
  ...props
}: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const uiSettings = createUISettings(props.uiSettings);
  const mapPadding: RNMapPadding = {
    top: insets.top + 20 + (offset?.top ?? 0),
    left: insets.left + 20 + (offset?.left ?? 0),
    bottom: insets.bottom + 20 + (offset?.bottom ?? 0),
    right: insets.right + 20 + (offset?.right ?? 0),
  };

  const [mapReady, setMapReady] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [map, setMapRef] = useMap();
  const [followingUser] = useIsFollowingUser();
  const { setUserLocated, setZoomLevel } = useMapActions();

  const initialLoc: RNLocation = useMemo(() => getInitialLocation(), []);
  const initialProps: RNInitialProps = { camera: { center: initialLoc.center, zoom: 16 } };

  const [locationUpdates, setLocationUpdates] = useState<RNLocation>(initialLoc);
  const heading = useHeading({ updateInterval: 'fast' });
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
      draggable: false,
    };
  }, [hideUserLocationMarker, animatedLatLng, heading]);

  const markers = useMemo<RNMarker[] | undefined>(() => {
    if (!mapLoaded || !mapReady) return undefined;
    return userLocationMarker ? [userLocationMarker, ...(props.markers || [])] : props.markers;
  }, [mapLoaded, mapReady, props.markers, userLocationMarker]);

  const onLocationUpdate = useCallback(
    (location: RNLocation) => {
      animateTo(location.center);
      setLocationStore(transformRNLocationToExpo(location));
      setLocationUpdates(location);
    },
    [animateTo]
  );

  const onCameraChangeComplete = useCallback(
    (_: RNRegion, camera: RNCamera, _isGesture: boolean) => {
      const areEqual = arePointsEqual(
        latLngToPoint(camera.center),
        latLngToPoint(userLocationMarker?.coordinate)
      );
      setUserLocated(areEqual);
    },
    [setUserLocated, userLocationMarker?.coordinate]
  );

  const onCameraChange = useCallback(
    (_region: RNRegion, camera: RNCamera, _isGesture: boolean) => {
      setZoomLevel(camera.zoom);
    },
    [setZoomLevel]
  );

  useEffect(() => {
    if (followingUser) {
      const newCam: Partial<RNCamera> = { bearing: heading, center: locationUpdates.center };
      map?.setCamera(newCam, false);
    }
  }, [heading, followingUser, locationUpdates, map]);

  return (
    <Box style={containerStyle} className={containerClassName ?? 'flex-1'}>
      <GoogleMapsView
        {...props}
        hybridRef={wrapCallback(setMapRef)}
        initialProps={props.initialProps ?? initialProps}
        markers={markers}
        uiSettings={uiSettings}
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
        onCameraChange={wrapCallback(props.onCameraChange, onCameraChange)}
        onCameraChangeComplete={wrapCallback(props.onCameraChangeComplete, onCameraChangeComplete)}
        onMapReady={wrapCallback(props.onMapReady, () => setMapReady(true))}
        onMapLoaded={wrapCallback(props.onMapLoaded, () => setMapLoaded(true))}
        onMapError={wrapCallback(props.onMapError, (e) => console.warn('Map error:', e))}
        onLocationUpdate={wrapCallback(props.onLocationUpdate, onLocationUpdate)}
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

export interface MapViewProps extends Props {
  mapRef?: React.RefObject<GoogleMapsViewRef | null>;
}

export default function MapViewWrapper({ mapRef: mapRefProp, ...props }: MapViewProps) {
  const localMapRef = useRef<GoogleMapsViewRef | null>(null);
  const mapRef = mapRefProp ?? localMapRef;

  return (
    <MapProvider mapRef={mapRef}>
      <MapView {...props} />
    </MapProvider>
  );
}

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

function createUISettings(overrides: RNMapUiSettings = {}) {
  return { ...UI_SETTINGS, ...overrides };
}

function getInitialLocation() {
  const currentLoc = getCurrentLocation();
  if (!currentLoc) return DEFAULT_LOCATION;
  return transformExpoLocationToRN(currentLoc);
}
