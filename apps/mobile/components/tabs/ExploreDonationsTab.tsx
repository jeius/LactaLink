import { useSelectedDataMarker } from '@/components/contexts/markers/DataMarker';
import { NoData } from '@/components/NoData';
import { RefreshButton } from '@/components/RefreshButton';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import DonationCard, {
  DonationCardSkeleton,
} from '@/features/donation&request/components/cards/DonationCard';
import { useNearestDonations } from '@/features/donation&request/hooks/useNearestListings';
import { useCurrentCoordinates } from '@/lib/stores';
import { getMinDistance } from '@/lib/utils/getMinDistance';
import { getNearestDeliveryPreference } from '@/lib/utils/getNearestDeliveryPreference';
import { createMarkerID } from '@/lib/utils/markerUtils';
import { createDirectionalShadow } from '@/lib/utils/shadows';
import { Collection } from '@lactalink/types/collections';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractCollection, listKeyExtractor } from '@lactalink/utilities/extractors';
import { formatKebab } from '@lactalink/utilities/formatters';
import { validatePoint } from '@lactalink/utilities/geo-utils';
import { ListRenderItem } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { MapPinIcon } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { AnimatedPressable } from '../animated/pressable';
import { VerticalInfiniteList } from '../lists/VerticalInfiniteList';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';

type TSlug = Extract<CollectionSlug, 'donations'>;
type TData = Collection<TSlug>;

const slug: TSlug = 'donations';
const TITLE = 'Available Donations';

function ListItem({ item, onPress }: { item: TData; onPress?: (item: TData) => void }) {
  const { deliveryPreferences } = item;

  const coordinates = useCurrentCoordinates();

  const minDistance = useMemo(() => {
    const preferences = extractCollection(deliveryPreferences);
    return getMinDistance(preferences, coordinates);
  }, [coordinates, deliveryPreferences]);

  return (
    <AnimatedPressable
      className="overflow-hidden rounded-2xl"
      containerStyle={createDirectionalShadow()}
      onPress={() => onPress?.(item)}
    >
      <DonationCard data={item} />
      {minDistance !== null && (
        <HStack
          space="xs"
          className="absolute right-0 top-0 items-center bg-background-100 p-2"
          style={{ borderBottomLeftRadius: 16 }}
        >
          <Icon size="sm" as={MapPinIcon} />
          <Text size="xs" className="font-JakartaMedium text-typography-700">
            {minDistance.toFixed(2)} km
          </Text>
        </HStack>
      )}
    </AnimatedPressable>
  );
}

export default function ExploreDonationsTab() {
  const { data, isPlaceholderData, ...query } = useNearestDonations();
  const router = useRouter();

  const setSelectedMarker = useSelectedDataMarker()[1];

  const handlePress = useCallback(
    (data: TData) => {
      const nearest = getNearestDeliveryPreference(extractCollection(data.deliveryPreferences));
      const address = extractCollection(nearest?.deliveryPreference?.address);
      const coordinates = address?.coordinates;

      if (validatePoint(coordinates)) {
        const markerID = createMarkerID(slug, data.id, coordinates);
        setSelectedMarker(markerID);
        router.push(`/map/explore/marker/${markerID}`);
      }
    },
    [router, setSelectedMarker]
  );

  const EmptyComponent = useCallback(() => {
    if (query.isLoading) return null;
    return (
      <Box className="pt-10">
        <NoData title={`No available ${formatKebab(slug)} found`} />
      </Box>
    );
  }, [query.isLoading]);

  const HeaderComponent = useCallback(() => {
    if (!data.length && !query.isLoading) return null;
    return (
      <HStack space="lg" className="items-center justify-between">
        <Text className="font-JakartaSemiBold">{TITLE}</Text>
        <RefreshButton refreshing={query.isRefetching} onRefresh={query.refetch} />
      </HStack>
    );
  }, [data.length, query.isLoading, query.isRefetching, query.refetch]);

  const renderItem: ListRenderItem<TData> = useCallback(
    ({ item }) => {
      if (isPlaceholderData) return <DonationCardSkeleton />;
      return <ListItem item={item} onPress={handlePress} />;
    },
    [handlePress, isPlaceholderData]
  );

  return (
    <VerticalInfiniteList
      useBottomSheetListComponent
      gap={16}
      data={data}
      keyExtractor={listKeyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={HeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={EmptyComponent}
      contentContainerStyle={{ padding: 16 }}
      refreshing={query.isRefetching}
      onRefresh={query.refetch}
      fetchNextPage={query.fetchNextPage}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
    />
  );
}
