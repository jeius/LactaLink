import { useHeading } from '@/hooks/location/useHeading';
import { getCurrentCoordinates } from '@/lib/stores';
import { useMapStore } from '@/lib/stores/mapStore';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { CompassIcon, LocateFixedIcon, LocateIcon } from 'lucide-react-native';
import { useCallback } from 'react';
import { useIsFollowingUser, useIsUserLocated, useMap } from '../contexts/MapProvider';
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
  const userMarker = useMapStore((s) => s.userMarker);
  const followUser = useMapStore((s) => s.followUser);
  const isUserLocated = useMapStore((s) => s.isUserLocated);

  function handleLocatePress() {
    if (isUserLocated && !followUser && !disableFollowUser) {
      userMarker?.followUser();
    } else if (followUser) {
      userMarker?.unFollowUser();
    } else {
      userMarker?.moveToCurrentPosition();
    }
  }

  return (
    <Button
      {...props}
      action={action}
      className={style({ className })}
      onPress={handleLocatePress}
      accessibilityLabel="Follow user location"
      accessibilityHint="Toggles following the user's current location"
      accessibilityRole="button"
      accessibilityState={{ selected: followUser }}
    >
      {followUser && (
        <Box
          className="absolute inset-0 rounded-full"
          style={{ opacity: 0.35, backgroundColor: 'black' }}
        />
      )}
      <ButtonIcon
        as={followUser ? CompassIcon : isUserLocated ? LocateFixedIcon : LocateIcon}
        height={22}
        width={22}
      />
    </Button>
  );
}

export function NewLocateButton({
  disableFollowUser = false,
  className,
  action = 'info',
  ...props
}: LocateButtonProps) {
  const mapRef = useMap();
  const [followingUser, setFollowUser] = useIsFollowingUser();
  const [userLocated] = useIsUserLocated();
  const heading = useHeading();

  const handleLocatePress = useCallback(() => {
    const animDuration = 300;
    if (userLocated && !followingUser && !disableFollowUser && mapRef) {
      mapRef.current?.setCamera({ tilt: 65, zoom: 18, bearing: heading }, true, animDuration);
      setTimeout(() => setFollowUser(true), animDuration);
    } else if (followingUser) {
      setFollowUser(false);
      setTimeout(
        () => mapRef.current?.setCamera({ tilt: 0, zoom: 16 }, true, animDuration),
        animDuration
      );
    } else {
      const userCoordinates = getCurrentCoordinates();
      if (mapRef.current && userCoordinates) {
        mapRef.current?.setCamera({ center: userCoordinates }, true, animDuration);
      }
    }
  }, [userLocated, followingUser, disableFollowUser, mapRef, heading, setFollowUser]);

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
