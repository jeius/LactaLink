import { Hospital, MilkBank, Point, Where } from '@lactalink/types';

import { HospitalListCard } from '@/components/cards/HospitalListCard';
import { MilkBankListCard } from '@/components/cards/MilkBankListCard';
import { NoData } from '@/components/NoData';
import { RefreshButton } from '@/components/RefreshButton';
import { RefreshControl } from '@/components/RefreshControl';
import { BottomSheetFlashList } from '@/components/ui/bottom-sheet';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { useCurrentLocation } from '@/hooks/location/useLocation';
import {
  extractCollection,
  extractID,
  formatCamelCase,
  generatePlaceHoldersWithID,
} from '@lactalink/utilities';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { capitalize } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { SceneProps } from './types';

export function OrganizationScene({ route, useBottomSheetList = false }: SceneProps) {
  const conditions: Where[] = [
    { 'owner.profile.relationTo': { equals: route.key } },
    { isDefault: { equals: true } },
  ];

  const { location } = useCurrentLocation();
  if (location) {
    const point: Point = [location.coords.longitude, location.coords.latitude];
    conditions.push({
      coordinates: { near: [...point, 9999 * 9999] },
    });
  }

  const res = useInfiniteFetchBySlug('addresses', true, {
    limit: 15,
    depth: 5,
    where: { and: conditions },
  });

  const data = useMemo(
    () =>
      res.data?.pages
        .flatMap((p) =>
          p?.docs.map((d) => {
            const profile = extractCollection(d?.owner)?.profile;
            return (
              (profile?.relationTo !== 'individuals' && extractCollection(profile?.value)) ||
              undefined
            );
          })
        )
        .filter((v) => v !== undefined) || [],
    [res.data]
  );

  const isLoading = res.isLoading;

  const placeholders = useMemo(
    () =>
      generatePlaceHoldersWithID<Hospital | MilkBank>(20, {
        id: 'placeholder',
        name: 'placeholder',
        createdAt: 'placeholder',
        updatedAt: 'placeholder',
      }),
    []
  );

  const renderItem: ListRenderItem<Hospital | MilkBank> = useCallback(
    ({ item }) => {
      const isLoading = extractID(item).includes('placeholder');

      switch (route.key) {
        case 'hospitals':
          return <HospitalListCard isLoading={isLoading} data={item as Hospital} />;

        case 'milkBanks':
          return <MilkBankListCard isLoading={isLoading} data={item as MilkBank} />;

        default:
          return null;
      }
    },
    [route.key]
  );

  function EmptyComponent() {
    return (
      !res.isLoading && (
        <Box className="pt-10">
          <NoData title={`No ${formatCamelCase(route.key)} found`} />
        </Box>
      )
    );
  }

  function HeaderComponent() {
    if (!data.length && !res.isLoading) return null;
    return (
      <HStack space="lg" className="items-center justify-between">
        <Text className="font-JakartaSemiBold">{capitalize(route.key)}</Text>
        <RefreshButton refreshing={res.isRefetching} onRefresh={res.refetch} />
      </HStack>
    );
  }

  return useBottomSheetList ? (
    <BottomSheetFlashList
      data={isLoading ? placeholders : data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${extractID(item)}-${index}`}
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
      data={isLoading ? placeholders : data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${extractID(item)}-${index}`}
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
