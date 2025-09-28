import { useMapStore } from '@/lib/stores/mapStore';
import { CompassIcon, LocateFixedIcon, LocateIcon } from 'lucide-react-native';
import { Button, ButtonIcon } from '../ui/button';

interface LocateButtonProps {
  disableFollowUser?: boolean;
}

export function LocateButton({ disableFollowUser = false }: LocateButtonProps) {
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
      action="info"
      className={`h-14 w-14 rounded-full p-3 ${followUser ? 'bg-info-600' : ''}`}
      onPress={handleLocatePress}
      accessibilityLabel="Follow user location"
      accessibilityHint="Toggles following the user's current location"
      accessibilityRole="button"
      accessibilityState={{ selected: followUser }}
    >
      <ButtonIcon
        as={followUser ? CompassIcon : isUserLocated ? LocateFixedIcon : LocateIcon}
        height={22}
        width={22}
      />
    </Button>
  );
}
