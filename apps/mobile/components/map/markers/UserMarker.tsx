import Avatar from '@/components/Avatar';

import { useMagnetometer } from '@/hooks/location/useMagnetometer';
import { getHexColor } from '@/lib/colors';
import { LocationObjectCoords } from 'expo-location';
import { debounce } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { LatLng, MapMarker, MarkerAnimated } from 'react-native-maps';
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

interface UserMarkerProps {
  mapRef?: React.RefObject<MapView | null>;
  followUser?: boolean;
  coordinates?: LocationObjectCoords;
  hideHeading?: boolean;
}

export function UserMarker({
  mapRef,
  followUser,
  coordinates: coords,
  hideHeading = false,
}: UserMarkerProps) {
  const { heading, animatedHeading } = useMagnetometer({ updateInterval: 'fast' });

  const markerRef = useRef<MapMarker>(null);

  const initialPosition = useMemo<LatLng>(
    () => ({
      latitude: coords?.latitude || 0,
      longitude: coords?.longitude || 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const headingContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${animatedHeading.value}deg` }],
    };
  });

  const setCameraHeading = debounce(
    () => {
      mapRef?.current?.animateCamera({ heading: heading - 90 }, { duration: 500 });
    },
    500,
    { trailing: true, maxWait: 500 }
  );

  useEffect(() => {
    if (followUser) {
      setCameraHeading();
    }
    markerRef.current?.redraw();
  }, [heading, followUser, mapRef]);

  useEffect(() => {
    if (coords) {
      const center: LatLng = {
        latitude: coords.latitude || 0,
        longitude: coords.longitude || 0,
      };

      markerRef.current?.animateMarkerToCoordinate(center, 400);

      if (followUser) {
        mapRef?.current?.animateCamera({ center }, { duration: 500 });
      }
    }
  }, [coords, followUser, mapRef]);

  return (
    <MarkerAnimated
      ref={markerRef}
      flat={true}
      identifier="user-marker-current-location"
      tappable={false}
      coordinate={initialPosition}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
      // style={{ backgroundColor: getHexColor('light', 'primary', 50) }}
    >
      <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'relative', padding: 4 }}>
          {!hideHeading && (
            <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-45deg' }] }]}>
              <Animated.View
                style={[headingContainerStyle, { flex: 1, borderRadius: 17, overflow: 'hidden' }]}
              >
                <View style={[headingStyle.arrow]} />
              </Animated.View>
            </View>
          )}
          <Avatar size="xs" className="border-primary-50" />
        </View>
      </View>
    </MarkerAnimated>
  );
}

export function UserAvatarMarker() {
  const { heading } = useMagnetometer({ updateInterval: 'fast' });

  return (
    <View style={{ position: 'relative', padding: 4 }}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ rotate: `${heading - 45}deg` }],
          },
        ]}
      >
        <View style={[headingStyle.arrow]} />
      </View>
      <Avatar size="sm" className="border-primary-50" />
    </View>
  );
}
