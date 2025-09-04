import { Address, CollectionSlug, Hospital, MilkBank, Where } from '@lactalink/types';

import { HospitalListCard } from '@/components/cards/HospitalListCard';
import { MilkBankListCard } from '@/components/cards/MilkBankListCard';
import { NoData } from '@/components/NoData';
import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { useLocationStore } from '@/lib/stores/locationStore';
import {
  extractCollection,
  extractID,
  formatCamelCase,
  generatePlaceHolders,
  isPlaceHolderData,
  latLngToPoint,
} from '@lactalink/utilities';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Href, useRouter } from 'expo-router';
import { debounce } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import Animated from 'react-native-reanimated';
import { AnimatedPressable } from '../animated/pressable';
import { useHideOnScrollAnimation, useScrollAnimationMethods } from '../contexts/ScrollProvider';
import { Input, InputField } from '../ui/input';

type DataType = {
  data: Hospital | MilkBank;
  address: Address;
};

const placeholders = generatePlaceHolders<DataType>(30, {
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

interface OrganizationListProps {
  collection: Extract<CollectionSlug, 'hospitals' | 'milkBanks'>;
}

export function OrganizationList({ collection }: OrganizationListProps) {
  const router = useRouter();

  const { scrollValue, ...scroll } = useScrollAnimationMethods();
  const headerAnimatedStyle = useHideOnScrollAnimation(scrollValue, {
    animationDirection: 'up',
    animateDistance: 60,
  });

  const [search, setSearch] = useState('');
  const debouncedSetSearch = debounce(setSearch, 200);

  const searchQuery = useInfiniteFetchBySlug(
    Boolean(search),
    {
      collection,
      limit: 15,
      depth: 0,
      where: { name: { contains: search } },
      select: { name: true, owner: true },
    },
    { placeholderData: (prevData) => prevData }
  );

  const searchedIDs = useMemo(
    () => searchQuery.data?.pages.flatMap((p) => extractID(p?.docs)) || [],
    [searchQuery.data?.pages]
  );

  const conditions: Where[] = [
    { 'owner.profile.relationTo': { equals: collection } },
    {
      'owner.profile.value': {
        in: searchedIDs,
      },
    },
    { isDefault: { equals: true } },
  ];

  const userCoords = useLocationStore((s) => s.coordinates);
  if (userCoords) {
    const point = latLngToPoint(userCoords);
    conditions.push({
      coordinates: { near: [...point, 9999 * 9999] },
    });
  }

  const addressQuery = useInfiniteFetchBySlug(
    true,
    {
      collection: 'addresses',
      limit: 15,
      depth: 5,
      where: { and: conditions },
    },
    { placeholderData: (prevData) => prevData }
  );

  const data = useMemo<DataType[]>(() => {
    if (search && !searchedIDs.length) {
      return [];
    }

    return (
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
        .filter((v) => v !== undefined) || []
    );
  }, [addressQuery.data?.pages, search, searchedIDs.length]);

  const isLoading = addressQuery.isPending;
  const hasNextPage = addressQuery.hasNextPage;
  const isFetchingNextPage = addressQuery.isFetchingNextPage;

  const renderItem: ListRenderItem<DataType> = useCallback(
    ({ item: { data, address } }) => {
      const isLoading = isPlaceHolderData(data);

      function handlePress() {
        if (isLoading) return;
        router.push(`/${collection}/${data.id}` as Href);
      }

      return (
        <AnimatedPressable
          disableAnimation={isLoading}
          onPress={handlePress}
          className="overflow-hidden rounded-xl"
        >
          {collection === 'hospitals' && (
            <HospitalListCard
              isLoading={isLoading}
              data={data as Hospital}
              address={address}
              canViewThumbnail
              size="sm"
              className="rounded-xl"
            />
          )}
          {collection === 'milkBanks' && (
            <MilkBankListCard
              isLoading={isLoading}
              data={data as MilkBank}
              address={address}
              canViewThumbnail
              size="sm"
              className="rounded-xl"
            />
          )}
        </AnimatedPressable>
      );
    },
    [collection, router]
  );

  function EmptyComponent() {
    return (
      !addressQuery.isLoading && (
        <Box className="pt-10">
          <NoData title={`No ${formatCamelCase(collection)} found`} />
        </Box>
      )
    );
  }

  return (
    <Box className="relative flex-1">
      <FlashList
        data={isLoading ? placeholders : data}
        renderItem={renderItem}
        keyExtractor={(item, idx) => `${item.data.id}-${item.address.id}-${idx}`}
        ListHeaderComponentStyle={{ marginBottom: 12 }}
        ListEmptyComponent={EmptyComponent}
        ItemSeparatorComponent={() => <Box className="h-4" />}
        ListFooterComponent={addressQuery.isFetchingNextPage ? <Spinner size="small" /> : null}
        onEndReachedThreshold={0.2}
        onEndReached={hasNextPage && !isFetchingNextPage ? addressQuery.fetchNextPage : undefined}
        contentContainerStyle={{ padding: 20, paddingTop: 60 + 16 }}
        refreshControl={
          <RefreshControl
            progressViewOffset={50}
            refreshing={addressQuery.isRefetching}
            onRefresh={addressQuery.refetch}
          />
        }
        onScroll={({ nativeEvent }) => scroll.onScroll(nativeEvent)}
        onScrollBeginDrag={({ nativeEvent }) => scroll.onScrollBeginDrag(nativeEvent)}
        onScrollEndDrag={({ nativeEvent }) => scroll.onScrollEndDrag(nativeEvent)}
      />
      <Animated.View
        style={[headerAnimatedStyle]}
        className="bg-background-0 border-outline-200 absolute inset-x-0 top-0 border-b px-4 py-3"
      >
        <Input variant="rounded" size="md">
          <InputField
            onChangeText={debouncedSetSearch}
            placeholder={`Search ${formatCamelCase(collection)}...`}
          />
        </Input>
      </Animated.View>
    </Box>
  );
}
