import { useHeading } from '@/hooks/location/useHeading';
import { getCurrentCoordinates } from '@/lib/stores';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { CompassIcon, LocateFixedIcon, LocateIcon } from 'lucide-react-native';
import { useCallback } from 'react';
import {
  useIsFollowingUser,
  useIsUserLocated,
  useMap,
  useMapZoomLevel,
} from '../contexts/MapProvider';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonProps } from '../ui/button';

const style = tva({
  base: 'h-12 w-12 items-center justify-center overflow-hidden rounded-full',
});

interface LocateButtonProps extends ButtonProps {
  disableFollowUser?: boolean;
}

export function LocateButton({
  disableFollowUser = false,
  className,
  action = 'info',
  ...props
}: LocateButtonProps) {
  const [map] = useMap();
  const [followingUser, setFollowUser] = useIsFollowingUser();
  const [userLocated] = useIsUserLocated();
  const heading = useHeading();
  const zoomLevel = useMapZoomLevel();

  const handleLocatePress = useCallback(() => {
    const animDuration = 300;
    if (userLocated && !followingUser && !disableFollowUser && map) {
      map?.setCamera(
        { tilt: 65, zoom: Math.max(19, zoomLevel.value), bearing: heading },
        true,
        animDuration
      );
      setTimeout(() => setFollowUser(true), animDuration);
    } else if (followingUser) {
      setFollowUser(false);
      setTimeout(
        () => map?.setCamera({ tilt: 0, zoom: Math.min(16, zoomLevel.value) }, true, animDuration),
        animDuration
      );
    } else {
      const userCoordinates = getCurrentCoordinates();
      if (map && userCoordinates) {
        map?.setCamera(
          { center: userCoordinates, zoom: Math.max(16, zoomLevel.value) },
          true,
          animDuration
        );
      }
    }
  }, [userLocated, followingUser, disableFollowUser, map, zoomLevel.value, heading, setFollowUser]);

  return (
    <Button
      {...props}
      action={action}
      className={style({ className })}
      onPress={handleLocatePress}
      accessibilityLabel="Follow user location"
      accessibilityHint="Toggles following the user's current location"
      accessibilityRole="button"
      accessibilityState={{ selected: followingUser }}
    >
      {followingUser && (
        <Box
          className="absolute inset-0 rounded-full"
          style={{ opacity: 0.35, backgroundColor: 'black' }}
        />
      )}
      <ButtonIcon
        as={followingUser ? CompassIcon : userLocated ? LocateFixedIcon : LocateIcon}
        height={22}
        width={22}
      />
    </Button>
  );
}
