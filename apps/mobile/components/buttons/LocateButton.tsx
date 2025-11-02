import { useMapStore } from '@/lib/stores/mapStore';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { CompassIcon, LocateFixedIcon, LocateIcon } from 'lucide-react-native';
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
