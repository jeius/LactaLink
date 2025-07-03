import Avatar from '@/components/Avatar';

import { useMagnetometer } from '@/hooks/location/useMagnetometer';
import { getHexColor } from '@/lib/colors';
import { LocationObjectCoords } from 'expo-location';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { LatLng, MapMarker, MarkerAnimated } from 'react-native-maps';

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
    borderRightWidth: 12,
    borderTopWidth: 12,
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
  const { heading } = useMagnetometer({ updateInterval: 'fast' });

  const roundedHeading = Math.round(heading / 10) * 10;

  const markerRef = useRef<MapMarker>(null);

  const initialPosition = useMemo<LatLng>(
    () => ({
      latitude: coords?.latitude || 0,
      longitude: coords?.longitude || 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (coords) {
      const center: LatLng = {
        latitude: coords.latitude || 0,
        longitude: coords.longitude || 0,
      };

      markerRef.current?.animateMarkerToCoordinate(center, 500);

      if (followUser) {
        mapRef?.current?.animateCamera(
          {
            center,
            heading: roundedHeading,
            altitude: coords.altitude || undefined,
            pitch: 65,
            zoom: 18,
          },
          { duration: 500 }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, roundedHeading, followUser]);

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
      <View style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'relative', padding: 4 }}>
          {!hideHeading && (
            <View
              style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${heading - 45}deg` }] }]}
            >
              <View style={[headingStyle.arrow]} />
            </View>
          )}
          <Avatar size="sm" className="border-primary-50" />
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
