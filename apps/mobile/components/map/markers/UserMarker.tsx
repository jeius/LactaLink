import Avatar from '@/components/Avatar';
import { Box } from '@/components/ui/box';
import { useLocationUpdates } from '@/hooks/location/useLocation';
import { useMagnetometer } from '@/hooks/location/useMagnetometer';

import { getHexColor } from '@/lib/colors';
import { LocationObjectCoords } from 'expo-location';
import { debounce } from 'lodash';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Camera, LatLng, MapMarker, MarkerAnimated } from 'react-native-maps';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

const headingStyle = StyleSheet.create({
  arrow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 18,
    borderTopWidth: 18,
    borderRightColor: 'transparent',
    borderTopColor: getHexColor('light', 'primary', 500),
  },
});

export interface UserMarkerRef {
  getHeading: () => number;
  getPosition: () => LocationObjectCoords | undefined;
}

interface UserMarkerProps {
  mapRef?: React.RefObject<MapView | null>;
  followUser?: boolean;
  hideHeading?: boolean;
  showAvatar?: boolean;
  camera?: Camera;
  onChangePosition?: (position: LocationObjectCoords) => void;
}

export const UserMarker = forwardRef<UserMarkerRef, UserMarkerProps>(
  (
    {
      mapRef,
      followUser,
      hideHeading = false,
      showAvatar = true,
      camera,
      onChangePosition,
    }: UserMarkerProps,
    ref
  ) => {
    const { heading, animatedHeading } = useMagnetometer({ updateInterval: 'fast' });
    const { location } = useLocationUpdates();

    const filteredHeading = useRef(heading);
    const markerRef = useRef<MapMarker>(null);

    const latlng = useMemo<LatLng>(
      () => ({
        latitude: location?.coords.latitude || 0,
        longitude: location?.coords.longitude || 0,
      }),
      [location]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initialPosition = useMemo<LatLng>(() => latlng, []);

    const headingContainerStyle = useAnimatedStyle(() => {
      return {
        transform: [{ rotate: `${animatedHeading.value}deg` }],
      };
    });

    const debouncedAnimateCamera = useMemo(
      () =>
        debounce(
          (center: LatLng, heading: number, altitude: number) => {
            mapRef?.current?.animateCamera({ center, heading, altitude }, { duration: 500 });
          },
          600,
          { maxWait: 1000, leading: true }
        ),
      [mapRef]
    );

    useEffect(() => {
      if (latlng) {
        const center: LatLng = {
          latitude: latlng.latitude || 0,
          longitude: latlng.longitude || 0,
        };

        if (followUser) {
          filteredHeading.current = filteredHeading.current * 0.8 + heading * 0.2;
          debouncedAnimateCamera(center, heading - 90, location?.coords.altitude || 0);
        } else {
          debouncedAnimateCamera.cancel();
        }

        redraw();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latlng, debouncedAnimateCamera, followUser, heading, mapRef]);

    useEffect(() => {
      if (latlng) {
        const center: LatLng = {
          latitude: latlng.latitude,
          longitude: latlng.longitude,
        };
        markerRef.current?.animateMarkerToCoordinate(center, 400);
      }
    }, [latlng]);

    useEffect(() => {
      if (location) {
        onChangePosition?.(location.coords);
      }
    }, [location, onChangePosition]);

    useEffect(() => {
      redraw();
    }, [camera]);

    useImperativeHandle(ref, () => ({
      getHeading: () => heading,
      getPosition: () => location?.coords,
    }));

    function redraw() {
      markerRef.current?.redraw();
    }

    return (
      <MarkerAnimated
        ref={markerRef}
        flat={true}
        identifier="user-marker-current-location"
        tappable={false}
        coordinate={initialPosition}
        tracksViewChanges={false}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'relative', padding: 4 }}>
            {!hideHeading && (
              <View
                style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-45deg' }] }]}
                onLayout={redraw}
              >
                <Animated.View
                  style={[headingContainerStyle, { flex: 1, borderRadius: 17, overflow: 'hidden' }]}
                >
                  <View style={[headingStyle.arrow]} />
                </Animated.View>
              </View>
            )}
            {showAvatar ? (
              <Animated.View
                style={{ transform: [{ rotate: `${camera?.heading || 0}deg` }] }}
                onLayout={redraw}
              >
                <Avatar size="xs" className="border-primary-50" fadeDuration={0} onLoad={redraw} />
              </Animated.View>
            ) : (
              <Box
                className="bg-primary-400 border-primary-0 h-6 w-6 rounded-full border-2"
                onLayout={redraw}
              />
            )}
          </View>
        </View>
      </MarkerAnimated>
    );
  }
);

UserMarker.displayName = 'UserMarker';
