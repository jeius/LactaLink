import { AnimatedMarker, useAnimatedRegion } from '@/components/animated/marker';
import { Box } from '@/components/ui/box';
import { UserLocationIcon } from '@/components/ui/icon/custom';
import { useAnimatedHeading } from '@/hooks/location/useHeading';
import { useLocationUpdates } from '@/hooks/location/useLocation';

import { getPrimaryColor } from '@/lib/colors';
import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { useMapStore } from '@/lib/stores/mapStore';
import { LocationObjectCoords } from 'expo-location';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LatLng, MapMarker } from 'react-native-maps';
import { useAnimatedReaction, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

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
  mapHeading?: SharedValue<number>;
}

export const UserMarker = forwardRef<UserMarkerRef, UserMarkerProps>(
  ({ hideHeading = false, onChangePosition, mapHeading }: UserMarkerProps, ref) => {
    const animatedHeading = useAnimatedHeading({
      updateInterval: 'fast',
      offset: mapHeading,
    });

    const { location } = useLocationUpdates();
    const latlng = useMemo<LatLng>(
      () =>
        location?.coords
          ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }
          : PHILIPPINES_COORDINATES,
      [location?.coords]
    );

    const [showHeading, setShowHeading] = useState(!hideHeading);

    const markerRef = useRef<MapMarker>(null);

    const mapRef = useMapStore((s) => s.map);
    const followUser = useMapStore((s) => s.followUser);
    const setFollowUser = useMapStore((s) => s.setFollowUser);

    const { animate, props: animatedProps } = useAnimatedRegion(latlng);

    // Callback to update camera heading
    const updateCameraHeading = useCallback(
      (heading: number) => {
        if (followUser && mapRef) {
          mapRef.setCamera({ center: latlng, heading: heading - 90 });
        }
      },
      [followUser, mapRef, latlng]
    );

    // Subscribe to animatedHeading changes
    useAnimatedReaction(
      () => animatedHeading.value,
      (currentHeading, previousHeading) => {
        if (currentHeading !== previousHeading) {
          scheduleOnRN(updateCameraHeading, currentHeading);
        }
      },
      [followUser, latlng]
    );

    useEffect(() => {
      animate({ ...latlng });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latlng]);

    useEffect(() => {
      setShowHeading(!hideHeading);
    }, [hideHeading]);

    useEffect(() => {
      redraw();
      setShowHeading(!followUser);
    }, [followUser]);

    useEffect(() => {
      if (location?.coords) {
        onChangePosition?.(location.coords);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location?.coords]);

    useImperativeHandle(ref, () => ({
      getHeading: () => animatedHeading.value,
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
          {
            pitch: pitch,
            zoom: Math.max(camera?.zoom || 18, 18),
            heading: animatedHeading.value - 90,
          },
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
      markerRef.current?.redraw();
    }

    return (
      <AnimatedMarker
        ref={markerRef}
        animatedProps={{ ...animatedProps }}
        rotation={animatedHeading as SharedValue<number | undefined>}
        identifier="user-marker-current-location"
        anchor={{ x: 0.5, y: 0.5 }}
        flat={true}
        tappable={false}
        tracksViewChanges={false}
      >
        {showHeading ? (
          <UserLocationIcon
            width={58}
            height={58}
            fill={getPrimaryColor('500')}
            stroke={getPrimaryColor('0')}
          />
        ) : (
          <Box
            className="h-5 w-5 rounded-full border-2 border-primary-0 bg-primary-500"
            onLayout={redraw}
          />
        )}
      </AnimatedMarker>
    );
  }
);

UserMarker.displayName = 'UserMarker';
