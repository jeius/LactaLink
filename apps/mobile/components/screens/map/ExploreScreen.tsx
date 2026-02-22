import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Box } from '@/components/ui/box';
import { Input, InputField, InputIcon } from '@/components/ui/input';
import DonationDetailsSheet from '@/features/map/components/DonationDetailsSheet';
import MapLayout from '@/features/map/components/MapLayout';
import MapListings from '@/features/map/components/MapListings';
import RequestDetailsSheet from '@/features/map/components/RequestDetailsSheet';
import { MapQueryParams } from '@/features/map/lib/types';
import { parseMarkerID } from '@/lib/utils/markerUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SearchIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { mrk, start, dest } = useLocalSearchParams<MapQueryParams>();
  const router = useRouter();

  const marker = useMemo(() => (mrk ? parseMarkerID(mrk) : null), [mrk]);
  const slug = marker?.slug;
  const id = marker?.id;

  const isDirectionsMode = !!start && !!dest;

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
        {!isDirectionsMode && (
          <Animated.View
            className="flex-row items-center gap-2 py-2 pl-3 pr-5"
            entering={FadeInDown.duration(300)}
            exiting={FadeOutUp.duration(300)}
          >
            <HeaderBackButton />

            <Input variant="rounded" className="flex-1 bg-background-0 shadow">
              <InputIcon as={SearchIcon} className="ml-3" />
              <InputField numberOfLines={1} placeholder="Search here..." />
            </Input>
          </Animated.View>
        )}

        {!isDirectionsMode && (
          <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOutUp.duration(300)}>
            <MapListings />
          </Animated.View>
        )}

        <DonationDetailsSheet
          donationID={id}
          open={slug === 'donations'}
          onDidDismiss={handleDidDismiss}
        />

        <RequestDetailsSheet
          requestID={id}
          open={slug === 'requests'}
          onDidDismiss={handleDidDismiss}
        />
      </Box>

      <Box className="bg-background-0" style={{ height: insets.bottom }} />
    </MapLayout>
  );
}
