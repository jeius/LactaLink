import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Box } from '@/components/ui/box';
import { Input, InputField, InputIcon } from '@/components/ui/input';
import { useDirectionIsActive } from '@/features/map/components/contexts/directions';
import DirectionDetails from '@/features/map/components/DirectionDetails';
import DonationDetailsSheet from '@/features/map/components/DonationDetailsSheet';
import { MapLayout } from '@/features/map/components/MapLayout';
import MapListings from '@/features/map/components/MapListings';
import RequestDetailsSheet from '@/features/map/components/RequestDetailsSheet';
import { MapQueryParams } from '@/features/map/lib/types';
import { parseMarkerID } from '@/lib/utils/markerUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SearchIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { ViewProps } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { mrk } = useLocalSearchParams<MapQueryParams>();
  const router = useRouter();

  const marker = useMemo(() => (mrk ? parseMarkerID(mrk) : null), [mrk]);
  const id = marker?.id;

  const handleDidDismiss = () => {
    router.setParams({ mrk: undefined } as MapQueryParams);
  };

  return (
    <MapLayout>
      <Box
        className="flex-1 justify-between"
        pointerEvents="box-none"
        style={{ paddingTop: insets.top }}
      >
        <FadeWrapper fadeDirection="up" className="flex-row items-center gap-2 py-2 pl-3 pr-5">
          <HeaderBackButton />

          <Input variant="rounded" className="flex-1 bg-background-0 shadow">
            <InputIcon as={SearchIcon} className="ml-3" />
            <InputField numberOfLines={1} placeholder="Search here..." />
          </Input>
        </FadeWrapper>

        <FadeWrapper fadeDirection="down">
          <MapListings />
        </FadeWrapper>
      </Box>

      <DonationDetailsSheet donationID={id} onDidDismiss={handleDidDismiss} />

      <RequestDetailsSheet requestID={id} onDidDismiss={handleDidDismiss} />

      <DirectionDetails />

      <Box className="bg-background-0" style={{ height: insets.bottom }} />
    </MapLayout>
  );
}

function FadeWrapper({
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
