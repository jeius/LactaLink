import { Box } from '@/components/ui/box';
import { UserLocationIcon } from '@/components/ui/icon/custom';
import { useLocationUpdates } from '@/hooks/location/useLocation';
import { useMagnetometer } from '@/hooks/location/useMagnetometer';

import { getPrimaryColor } from '@/lib/colors';
import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { useMapStore } from '@/lib/stores/mapStore';
import { LocationObjectCoords } from 'expo-location';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LatLng, MapMarker, MarkerAnimated } from 'react-native-maps';
import { useSharedValue, withTiming } from 'react-native-reanimated';

function useAnimatedRegion({ latitude, longitude }: LatLng) {
  const lat = useSharedValue(latitude);
  const lng = useSharedValue(longitude);

  useEffect(() => {
    lat.value = withTiming(latitude, { duration: 300 });
    lng.value = withTiming(longitude, { duration: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  return { latitude: lat.value, longitude: lng.value };
}

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

    const [showHeading, setShowHeading] = useState(!hideHeading);

    const markerRef = useRef<MapMarker>(null);

    const mapRef = useMapStore((s) => s.map);
    const followUser = useMapStore((s) => s.followUser);
    const setFollowUser = useMapStore((s) => s.setFollowUser);

    const latlng = useMemo<LatLng>(
      () =>
        location?.coords
          ? {
              latitude: location.coords.latitude || 0,
              longitude: location.coords.longitude || 0,
            }
          : PHILIPPINES_COORDINATES,
      [location?.coords]
    );

    const animatedRegion = useAnimatedRegion(latlng);

    useEffect(() => {
      if (followUser) {
        const heading = filteredHeading - 90;
        mapRef?.setCamera({ center: latlng, heading, altitude: location?.coords.altitude || 0 });
      }
    }, [filteredHeading, followUser, latlng, location?.coords.altitude, mapRef]);

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
      markerRef.current?.redraw();
    }

    return (
      <MarkerAnimated
        ref={markerRef}
        coordinate={animatedRegion}
        rotation={animatedHeading.value}
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
            className="bg-primary-500 border-primary-0 h-5 w-5 rounded-full border-2"
            onLayout={redraw}
          />
        )}
      </MarkerAnimated>
    );
  }
);

UserMarker.displayName = 'UserMarker';
