import { DonationListCard } from '@/components/cards/DonationListCard';
import { createMarkerID, useSelectedDataMarker } from '@/components/contexts/DataMarkerProvider';
import { NoData } from '@/components/NoData';
import { RefreshButton } from '@/components/RefreshButton';
import { RefreshControl } from '@/components/RefreshControl';
import { BottomSheetFlashList } from '@/components/ui/bottom-sheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { VStack } from '@/components/ui/vstack';
import { useFetchNearest } from '@/hooks/collections/useFetchNearest';
import { RequestCreateParams } from '@/lib/types/donationRequest';
import { getNearestDeliveryPreference } from '@/lib/utils/getNearestDeliveryPreference';
import { Collection } from '@lactalink/types/collections';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection } from '@lactalink/utilities/extractors';
import { formatKebab } from '@lactalink/utilities/formatters';
import { validatePoint } from '@lactalink/utilities/geo-utils';
import { ListRenderItem } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { ChevronRightIcon } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { GestureResponderEvent, Text } from 'react-native';

type TSlug = Extract<CollectionSlug, 'donations'>;
type TData = Collection<TSlug>;

const PLACEHOLDER = generatePlaceHoldersWithID(20, {} as TData);
const slug: TSlug = 'donations';
const TITLE = 'Available Donations';
const ACTION = 'Request';

export default function ExploreDonationsTab() {
  const res = useFetchNearest(slug);
  const router = useRouter();

  const data = useMemo(() => {
    if (res.isLoading) return PLACEHOLDER;
    return res.data?.pages.flatMap((p) => p?.docs).filter((v) => v !== undefined) || [];
  }, [res.data?.pages, res.isLoading]);

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
    if (res.isLoading) return null;
    return (
      <Box className="pt-10">
        <NoData title={`No available ${formatKebab(slug)} found`} />
      </Box>
    );
  }, [res.isLoading]);

  const HeaderComponent = useCallback(() => {
    if (!data.length && !res.isLoading) return null;
    return (
      <HStack space="lg" className="items-center justify-between">
        <Text className="font-JakartaSemiBold">{TITLE}</Text>
        <RefreshButton refreshing={res.isRefetching} onRefresh={res.refetch} />
      </HStack>
    );
  }, [data.length, res.isLoading, res.isRefetching, res.refetch]);

  const renderItem: ListRenderItem<TData> = useCallback(
    ({ item }) => {
      const isLoading = isPlaceHolderData(item);

      function Action() {
        function handleAction(e: GestureResponderEvent) {
          e.stopPropagation();
          const params: RequestCreateParams = { mdid: item.id };
          router.push({ pathname: '/requests/create', params });
        }

        function handleView(e: GestureResponderEvent) {
          e.stopPropagation();
          handlePress(item);
        }

        return (
          <VStack space="md" className="items-stretch justify-center">
            <Button size="sm" onPress={handleAction}>
              <ButtonText>{ACTION}</ButtonText>
            </Button>
            <Button
              variant="link"
              action="default"
              size="sm"
              className="h-fit"
              hitSlop={6}
              onPress={handleView}
            >
              <ButtonText>Details</ButtonText>
              <ButtonIcon as={ChevronRightIcon} />
            </Button>
          </VStack>
        );
      }

      return (
        <DonationListCard
          isLoading={isLoading}
          data={item}
          showAvatar
          showMinDistance
          canViewThumbnail={false}
          action={<Action />}
        />
      );
    },
    [handlePress, router]
  );

  return (
    <BottomSheetFlashList
      data={data}
      keyExtractor={(item, idx) => `${slug}-${item.id}-${idx}`}
      renderItem={renderItem}
      ListHeaderComponent={HeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={() => <Box style={{ height: 16 }} />}
      ListFooterComponent={res.isFetchingNextPage ? <Spinner size="small" /> : null}
      onEndReachedThreshold={0.2}
      onEndReached={res.hasNextPage && !res.isFetchingNextPage ? res.fetchNextPage : undefined}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={res.isRefetching} onRefresh={res.refetch} />}
    />
  );
}
