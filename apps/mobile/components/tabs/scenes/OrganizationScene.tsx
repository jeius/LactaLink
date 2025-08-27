import { Address, Hospital, MilkBank, Where } from '@lactalink/types';

import { HospitalListCard } from '@/components/cards/HospitalListCard';
import { MilkBankListCard } from '@/components/cards/MilkBankListCard';
import { NoData } from '@/components/NoData';
import { RefreshButton } from '@/components/RefreshButton';
import { RefreshControl } from '@/components/RefreshControl';
import { BottomSheetFlashList } from '@/components/ui/bottom-sheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { useLocationStore } from '@/lib/stores/locationStore';
import { RecipientSearchParams } from '@/lib/types/donationRequest';
import {
  extractCollection,
  extractID,
  formatCamelCase,
  generatePlaceHolders,
  latLngToPoint,
} from '@lactalink/utilities';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Href, Link } from 'expo-router';
import { capitalize } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { SceneProps } from './types';

type DataType = {
  data: Hospital | MilkBank;
  address: Address;
};

const placeholders = generatePlaceHolders<DataType>(20, {
  data: {
    id: `placeholder`,
    name: 'placeholder',
    createdAt: 'placeholder',
    updatedAt: 'placeholder',
  },
  address: {
    id: 'placeholder',
    createdAt: 'placeholder',
    updatedAt: 'placeholder',
    cityMunicipality: 'placeholder',
    province: 'placeholder',
  },
});

export function OrganizationScene({
  route,
  useBottomSheetList = false,
  actionCollection,
  canViewThumbnails = true,
}: SceneProps) {
  const conditions: Where[] = [
    { 'owner.profile.relationTo': { equals: route.key } },
    { isDefault: { equals: true } },
  ];

  const userCoords = useLocationStore((s) => s.coordinates);
  if (userCoords) {
    const point = latLngToPoint(userCoords);
    conditions.push({
      coordinates: { near: [...point, 9999 * 9999] },
    });
  }

  const addressQuery = useInfiniteFetchBySlug(true, {
    collection: 'addresses',
    limit: 15,
    depth: 5,
    where: { and: conditions },
  });

  const data = useMemo<DataType[]>(
    () =>
      addressQuery.data?.pages
        .flatMap((page) =>
          page?.docs.map((address) => {
            const profile = extractCollection(address?.owner)?.profile;

            const isIndividual = profile?.relationTo === 'individuals';
            if (isIndividual) return undefined;

            const data = extractCollection(profile?.value);
            if (!data) return undefined;
            return { data, address };
          })
        )
        .filter((v) => v !== undefined) || [],
    [addressQuery.data]
  );

  const isLoading = addressQuery.isPending;
  const hasNextPage = addressQuery.hasNextPage;
  const isFetchingNextPage = addressQuery.isFetchingNextPage;

  const renderItem: ListRenderItem<DataType> = useCallback(
    ({ item: { data, address } }) => {
      const isLoading = extractID(data).includes('placeholder');

      function Action() {
        let actionButtonLabel = 'View';
        let href: Href = '/+not-found';

        const params: RecipientSearchParams = {
          recipientSlug: route.key as RecipientSearchParams['recipientSlug'],
          recipientID: data.id,
        };

        if (actionCollection === 'requests') {
          href = { pathname: '/requests/create', params };
          actionButtonLabel = 'Request';
        } else if (actionCollection === 'donations') {
          href = { pathname: '/donations/create', params };
          actionButtonLabel = 'Donate';
        }

        return (
          <VStack space="sm" className="items-center justify-center">
            <Link href={href} asChild>
              <Button size="sm">
                <ButtonText>{actionButtonLabel}</ButtonText>
              </Button>
            </Link>
          </VStack>
        );
      }

      switch (route.key) {
        case 'hospitals':
          return (
            <HospitalListCard
              isLoading={isLoading}
              data={data as Hospital}
              address={address}
              canViewThumbnail={canViewThumbnails}
              action={<Action />}
            />
          );

        case 'milkBanks':
          return (
            <MilkBankListCard
              isLoading={isLoading}
              data={data as MilkBank}
              address={address}
              canViewThumbnail={canViewThumbnails}
              action={<Action />}
            />
          );

        default:
          return null;
      }
    },
    [actionCollection, canViewThumbnails, route.key]
  );

  function EmptyComponent() {
    return (
      !addressQuery.isLoading && (
        <Box className="pt-10">
          <NoData title={`No ${formatCamelCase(route.key)} found`} />
        </Box>
      )
    );
  }

  function HeaderComponent() {
    if (!data.length && !addressQuery.isLoading) return null;
    return (
      <HStack space="lg" className="items-center justify-between">
        <Text className="font-JakartaSemiBold">{capitalize(route.key)}</Text>
        <RefreshButton refreshing={addressQuery.isRefetching} onRefresh={addressQuery.refetch} />
      </HStack>
    );
  }

  return useBottomSheetList ? (
    <BottomSheetFlashList
      data={isLoading ? placeholders : data}
      renderItem={renderItem}
      keyExtractor={(item, idx) => `${item.data.id}-${item.address.id}-${idx}`}
      ListHeaderComponent={HeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={() => <Box className="h-4" />}
      ListFooterComponent={addressQuery.isFetchingNextPage ? <Spinner size="small" /> : null}
      onEndReachedThreshold={0.2}
      onEndReached={hasNextPage && !isFetchingNextPage ? addressQuery.fetchNextPage : undefined}
      contentContainerStyle={{ padding: 16 }}
    />
  ) : (
    <FlashList
      data={isLoading ? placeholders : data}
      renderItem={renderItem}
      keyExtractor={(item, idx) => `${item.data.id}-${item.address.id}-${idx}`}
      ListHeaderComponent={HeaderComponent}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={() => <Box className="h-4" />}
      ListFooterComponent={addressQuery.isFetchingNextPage ? <Spinner size="small" /> : null}
      onEndReachedThreshold={0.2}
      onEndReached={hasNextPage && !isFetchingNextPage ? addressQuery.fetchNextPage : undefined}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={addressQuery.isRefetching} onRefresh={addressQuery.refetch} />
      }
    />
  );
}
