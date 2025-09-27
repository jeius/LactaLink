import { AnimatedMarker, useAnimatedRegion } from '@/components/animated/marker';
import { Box } from '@/components/ui/box';
import { useLocationUpdates } from '@/hooks/location/useLocation';
import { useMagnetometer } from '@/hooks/location/useMagnetometer';

import { getHexColor } from '@/lib/colors';
import { useMapStore } from '@/lib/stores/mapStore';
import { LocationObjectCoords } from 'expo-location';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { LatLng } from 'react-native-maps';
import { SharedValue } from 'react-native-reanimated';

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
  moveToCurrentPosition: () => void;
  followUser: (pitch?: number) => Promise<void>;
  unFollowUser: () => void;
}

interface UserMarkerProps {
  hideHeading?: boolean;
  onChangePosition?: (position: LocationObjectCoords) => void;
}

export const UserMarker = forwardRef<UserMarkerRef, UserMarkerProps>(
  ({ hideHeading = false, onChangePosition }: UserMarkerProps, ref) => {
    const { heading, animatedHeading, filteredHeading } = useMagnetometer({
      updateInterval: 'fast',
    });
    const { location } = useLocationUpdates();

    const mapRef = useMapStore((s) => s.map);
    const followUser = useMapStore((s) => s.followUser);
    const setFollowUser = useMapStore((s) => s.setFollowUser);

    const [childrenLoaded, setChildrenLoaded] = useState(false);

    const latlng = useMemo<LatLng>(
      () => ({
        latitude: location?.coords.latitude || 0,
        longitude: location?.coords.longitude || 0,
      }),
      [location?.coords.latitude, location?.coords.longitude]
    );

    const animatedRegion = useAnimatedRegion(latlng);

    useEffect(() => {
      if (followUser) {
        const heading = filteredHeading - 90;
        mapRef?.setCamera({ center: latlng, heading, altitude: location?.coords.altitude || 0 });
      }
    }, [filteredHeading, followUser, latlng, location?.coords.altitude, mapRef]);

    useEffect(() => {
      animatedRegion.animate({ ...latlng, duration: 300 });
    }, [animatedRegion, latlng]);

    useEffect(() => {
      if (location) {
        onChangePosition?.(location.coords);
      }
    }, [location, onChangePosition]);

    useImperativeHandle(ref, () => ({
      getHeading: () => heading,
      getPosition: () => location?.coords,
      moveToCurrentPosition: async () => {
        const camera = await mapRef?.getCamera();
        if (camera) {
          mapRef?.animateCamera(
            { center: latlng, zoom: Math.max(camera.zoom || 16, 16) },
            { duration: 500 }
          );
        }
      },
      followUser: async (pitch = 65) => {
        const camera = await mapRef?.getCamera();
        mapRef?.animateCamera(
          { pitch: pitch, zoom: Math.max(camera?.zoom || 18, 18), heading: heading - 90 },
          { duration: 500 }
        );
        setTimeout(() => {
          setFollowUser(true);
        }, 500);
      },
      unFollowUser: () => {
        setFollowUser(false);
        setTimeout(async () => {
          const camera = await mapRef?.getCamera();
          mapRef?.animateCamera(
            { pitch: 0, zoom: Math.min(camera?.zoom || 18, 18) },
            { duration: 500 }
          );
        }, 50);
      },
    }));

    function redraw() {
      setChildrenLoaded(true);
    }

    return (
      <AnimatedMarker
        flat={true}
        identifier="user-marker-current-location"
        tappable={false}
        animatedProps={animatedRegion.props}
        tracksViewChanges={!childrenLoaded}
        anchor={{ x: 0.5, y: 0.5 }}
        rotation={animatedHeading as SharedValue<number | undefined>}
      >
        <Box style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <Box style={{ position: 'relative', padding: 4 }}>
            {!hideHeading && (
              <Box
                style={[
                  StyleSheet.absoluteFill,
                  {
                    flex: 1,
                    borderRadius: 17,
                    overflow: 'hidden',
                    transform: [{ rotate: '-45deg' }],
                  },
                ]}
              >
                <Box style={[headingStyle.arrow]} />
              </Box>
            )}
            <Box
              className="bg-primary-400 border-primary-0 h-5 w-5 rounded-full border-2"
              onLayout={redraw}
            />
          </Box>
        </Box>
      </AnimatedMarker>
    );
  }
);

UserMarker.displayName = 'UserMarker';
