import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Box } from '@/components/ui/box';
import { useDirectionIsActive } from '@/features/directions/components/DirectionsProvider';
import DirectionDetails from '@/features/map/components/DirectionDetails';
import MapLayout from '@/features/map/components/MapLayout';
import MapListings from '@/features/map/components/MapListings';
import MapSearchInput from '@/features/map/components/MapSearchInput';
import MarkerDetailsSheet from '@/features/map/components/MarkerDetailsSheet';
import { ViewProps } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <MapLayout>
      <Box
        className="flex-1 justify-between"
        pointerEvents="box-none"
        style={{ paddingTop: insets.top }}
      >
        <FadeView fadeDirection="up" className="flex-row gap-2 py-2 pl-3 pr-5">
          <HeaderBackButton />

          <MapSearchInput className="flex-1" />
        </FadeView>

        <FadeView fadeDirection="down">
          <MapListings />
        </FadeView>
      </Box>

      <MarkerDetailsSheet />

      <DirectionDetails />

      <Box className="bg-background-0" style={{ height: insets.bottom }} />
    </MapLayout>
  );
}

function FadeView({
  children,
  fadeDirection = 'up',
  ...props
}: ViewProps & {
  fadeDirection?: 'down' | 'up';
}) {
  const isUp = fadeDirection === 'up';
  const isDirectionsMode = useDirectionIsActive();

  return (
    !isDirectionsMode && (
      <Animated.View
        {...props}
        entering={isUp ? FadeInUp.duration(300) : FadeInDown.duration(300)}
        exiting={isUp ? FadeOutUp.duration(300) : FadeOutDown.duration(300)}
      >
        {children}
      </Animated.View>
    )
  );
}
