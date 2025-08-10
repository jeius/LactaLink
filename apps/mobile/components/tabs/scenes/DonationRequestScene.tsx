import { Donation, Request } from '@lactalink/types';

import { DonationListCard, RequestListCard } from '@/components/cards';
import { Image } from '@/components/Image';
import { NoData } from '@/components/NoData';
import { RefreshButton } from '@/components/RefreshButton';
import { RefreshControl } from '@/components/RefreshControl';
import { BottomSheetFlashList } from '@/components/ui/bottom-sheet';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useFetchNearest } from '@/hooks/collections/useFetchNearest';
import { getIconAsset } from '@/lib/stores';
import { formatKebab, generatePlaceHolders } from '@lactalink/utilities';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { capitalize } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { SceneProps } from './types';

export function DonationRequestScene<T extends Donation | Request = Donation | Request>({
  route,
  useBottomSheetList = false,
  onPress,
}: SceneProps<T>) {
  const res = useFetchNearest(route.key as 'donations' | 'requests');

  const placeholders = useMemo(
    () => generatePlaceHolders(20, { id: 'placeholder' } as Donation | Request),
    []
  );

  const data = useMemo(
    () => res.data?.pages.flatMap((p) => p?.docs).filter((v) => v !== undefined) || [],
    [res.data]
  );

  const icon = getIconAsset(route.key === 'requests' ? 'milkBasket' : 'receiveMilk');

  const renderItem: ListRenderItem<T> = useCallback(
    ({ item }) => {
      const isLoading = item.id.includes('placeholder');

      switch (route.key) {
        case 'donations':
          return (
            <DonationListCard onPress={onPress} isLoading={isLoading} data={item as Donation} />
          );

        case 'requests':
          return <RequestListCard onPress={onPress} isLoading={isLoading} data={item as Request} />;

        default:
          return null;
      }
    },
    [onPress, route.key]
  );

  function EmptyComponent() {
    return (
      !res.isLoading && (
        <Box className="pt-10">
          <NoData title={`No available ${formatKebab(route.key)} found`} />
        </Box>
      )
    );
  }

  function HeaderComponent() {
    if (!data.length && !res.isLoading) return null;
    return (
      <HStack space="lg" className="items-center justify-between">
        <HStack space="sm" className="items-center">
          <Image source={icon} style={{ width: 24, aspectRatio: 1 }} />
          <Text className="font-JakartaSemiBold">Available {capitalize(route.key)}</Text>
        </HStack>
        <RefreshButton refreshing={res.isRefetching} onRefresh={res.refetch} />
      </HStack>
    );
  }

  return useBottomSheetList ? (
    <BottomSheetFlashList
      data={res.isLoading ? placeholders : data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      ListHeaderComponent={HeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={() => <Box className="h-4" />}
      ListFooterComponent={res.isFetchingNextPage ? <Spinner size="small" /> : null}
      onEndReachedThreshold={0.2}
      onEndReached={res.hasNextPage && !res.isFetchingNextPage ? res.fetchNextPage : undefined}
      contentContainerStyle={{ padding: 16 }}
    />
  ) : (
    <FlashList
      data={res.isLoading ? placeholders : data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      ListHeaderComponent={HeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={() => <Box className="h-4" />}
      ListFooterComponent={res.isFetchingNextPage ? <Spinner size="small" /> : null}
      onEndReachedThreshold={0.2}
      onEndReached={res.hasNextPage && !res.isFetchingNextPage ? res.fetchNextPage : undefined}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={res.isRefetching} onRefresh={res.refetch} />}
    />
  );
}
