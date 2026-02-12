import { AnimatedPressable } from '@/components/animated/pressable';
import { BasicCarousel } from '@/components/ui/BasicCarousel';
import { Box } from '@/components/ui/box';
import CollapsibleView from '@/components/ui/CollapsibleView';
import ScrollView from '@/components/ui/ScrollView';
import { Text } from '@/components/ui/text';
import {
  useNearestDonations,
  useNearestRequests,
} from '@/features/donation&request/hooks/useNearestListings';
import { MapListingItem, MapListingSlug, MapQueryParams } from '@/features/map/lib/types';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { formatCamelCaseCaps } from '@lactalink/utilities/formatters';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { extractListingData } from '../lib/utils/extractListingData';
import MapListItem from './MapListItem';

const ITEM_WIDTH = 192;
const ITEM_SPACING = 6;
const LIST_SLUGS: MapListingSlug[] = ['donations', 'requests', 'hospitals', 'milkBanks'];

const pressableStyle = tva({
  base: 'overflow-hidden rounded-full border border-outline-400 bg-background-0 px-3 py-2 shadow',
  variants: {
    selected: {
      true: 'bg-background-100',
    },
  },
});

export default function MapListings() {
  const { list } = useLocalSearchParams<MapQueryParams>();
  const router = useRouter();

  const expand = Boolean(list);

  const { data: donations, ...donationsQuery } = useNearestDonations();
  const { data: requests, ...requestsQuery } = useNearestRequests();

  const donationsListings = useMemo(
    () => donations?.map(extractListingData).filter((v) => v !== null),
    [donations]
  );

  const requestsListings = useMemo(
    () => requests?.map(extractListingData).filter((v) => v !== null),
    [requests]
  );

  const hasNextPage =
    list === 'donations'
      ? donationsQuery.hasNextPage
      : list === 'requests'
        ? requestsQuery.hasNextPage
        : false;

  const isFetchingNextPage =
    list === 'donations'
      ? donationsQuery.isFetchingNextPage
      : list === 'requests'
        ? requestsQuery.isFetchingNextPage
        : false;

  const handleFetchNextPage = useCallback(() => {
    if (list === 'donations' && donationsQuery.hasNextPage) {
      donationsQuery.fetchNextPage();
    } else if (list === 'requests' && requestsQuery.hasNextPage) {
      requestsQuery.fetchNextPage();
    }
  }, [list, donationsQuery, requestsQuery]);

  function setListParams(slug: MapListingSlug) {
    router.setParams({ list: slug } as MapQueryParams);
  }

  function setMarkerID({ markerID }: MapListingItem) {
    router.setParams({ mrk: markerID, lat: undefined, lng: undefined } as MapQueryParams);
  }

  return (
    <Box>
      <ScrollView
        horizontal
        overScrollMode="never"
        contentContainerClassName="items-center p-2 gap-2"
      >
        {LIST_SLUGS.map((slug, i) => (
          <AnimatedPressable
            key={i}
            onPress={() => setListParams(slug)}
            aria-selected={list === slug}
            className={pressableStyle({ selected: list === slug })}
          >
            <Text className="font-JakartaSemiBold">{formatCamelCaseCaps(slug)}</Text>
          </AnimatedPressable>
        ))}
      </ScrollView>

      <CollapsibleView expand={expand}>
        <BasicCarousel
          data={
            list === 'donations' ? donationsListings : list === 'requests' ? requestsListings : []
          }
          itemWidth={ITEM_WIDTH}
          itemSpacing={ITEM_SPACING}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={handleFetchNextPage}
          contentContainerClassName="px-4 py-2"
          renderItem={({ item, isFocused }) => (
            <MapListItem
              width={ITEM_WIDTH}
              height={128}
              item={item}
              isFocused={isFocused}
              onPress={setMarkerID}
            />
          )}
        />
      </CollapsibleView>
    </Box>
  );
}
