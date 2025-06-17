import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import GorhomBottomSheet from '@gorhom/bottom-sheet';

import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { useApiClient } from '@lactalink/api';
import { CollectionSlug, Donation, Hospital, MilkBank, Request } from '@lactalink/types';
import { ListRenderItem } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { Dimensions } from 'react-native';
import DonationCard, { DonationSkeleton } from '../cards/DonationCard';
import InfoCard from '../cards/InfoCard';
import RequestCard, { RequestSkeleton } from '../cards/RequestCard';
import { RefreshControl } from '../RefreshControl';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDragIndicator,
  BottomSheetFlashList,
  BottomSheetPortal,
  BottomSheetScrollView,
} from '../ui/bottom-sheet';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const DEFAULT_SNAP_POINT = 30;

type SectionId = 'donations' | 'requests' | 'hospitals' | 'milk-banks';
type Data = Donation | Request | MilkBank | Hospital | { id: string };
type Section = {
  id: SectionId;
  title: string;
  data: Data[];
  isFetchingNextPage: boolean;
  isLoading: boolean;
  fetchNextPage: () => unknown;
  refetch: () => unknown;
  hasNextPage: boolean;
  isFetching: boolean;
};

export interface MapBottomSheetProps {
  id?: string;
  slug?: Extract<CollectionSlug, 'donations' | 'requests' | 'hospitals' | 'milkBanks'>;
  onSelected?: (id: string) => void;
}

export function MapBottomSheet({ id, slug, onSelected }: MapBottomSheetProps) {
  const bottomSheetRef = useRef<GorhomBottomSheet>(null);
  const [open, setOpen] = useState(true);
  const apiClient = useApiClient();
  const DEVICE_WIDTH = Dimensions.get('window').width;

  const hasSelectedItem = Boolean(id && slug);

  const handleChanged = useCallback(
    (id: string) => {
      onSelected?.(id);
    },
    [onSelected]
  );

  const snapPoints = useMemo(
    () =>
      hasSelectedItem ? [DEFAULT_SNAP_POINT, '40%'] : [DEFAULT_SNAP_POINT, '40%', '60%', '80%'],
    [hasSelectedItem]
  );

  const {
    data: selected,
    isLoading,
    isFetching,
  } = useQuery({
    enabled: hasSelectedItem,
    initialData: null,
    queryKey: ['map-bottom-sheet', id, slug],
    queryFn: () => (id && slug && apiClient.findByID({ id, collection: slug, depth: 3 })) || null,
  });

  const {
    data: infiniteDonations,
    fetchNextPage: fetchNextDonationsPage,
    hasNextPage: hasNextDonationsPage,
    isLoading: isLoadingDonations,
    isFetching: isFetchingDonations,
    isFetchingNextPage: isFetchingNextDonationsPage,
    refetch: refetchDonations,
  } = useInfiniteFetchBySlug('donations', !hasSelectedItem, {
    where: { status: { equals: 'AVAILABLE' } },
  });

  const {
    data: infiniteRequests,
    fetchNextPage: fetchNextRequestsPage,
    hasNextPage: hasNextRequestsPage,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
    isFetchingNextPage: isFetchingNextRequestsPage,
    refetch: refetchRequests,
  } = useInfiniteFetchBySlug('requests', !hasSelectedItem, {
    where: { status: { equals: 'PENDING' } },
  });

  const {
    data: infiniteHospitals,
    fetchNextPage: fetchNextHospitalsPage,
    hasNextPage: hasNextHospitalsPage,
    isLoading: isLoadingHospitals,
    isFetching: isFetchingHospitals,
    isFetchingNextPage: isFetchingNextHospitalsPage,
    refetch: refetchHospitals,
  } = useInfiniteFetchBySlug('hospitals', !hasSelectedItem);

  const {
    data: infiniteMilkBanks,
    fetchNextPage: fetchNextMilkBanksPage,
    hasNextPage: hasNextMilkBanksPage,
    isLoading: isLoadingMilkBanks,
    isFetching: isFetchingMilkBanks,
    isFetchingNextPage: isFetchingNextMilkBanksPage,
    refetch: refetchMilkBanks,
  } = useInfiniteFetchBySlug('milkBanks', !hasSelectedItem);

  const sections = useMemo((): Section[] => {
    return [
      {
        id: 'donations',
        title: 'Available Donations',
        isFetchingNextPage: isFetchingNextDonationsPage,
        isLoading: isLoadingDonations,
        fetchNextPage: fetchNextDonationsPage,
        refetch: refetchDonations,
        hasNextPage: hasNextDonationsPage,
        isFetching: isFetchingDonations,
        data:
          infiniteDonations?.pages.flatMap((page) => page.docs) ||
          Array.from({ length: 5 }, (_, idx) => ({ id: `placeholder-${idx}` })),
      },
      {
        id: 'requests',
        title: 'Available Requests',
        isFetchingNextPage: isFetchingNextRequestsPage,
        isLoading: isLoadingRequests,
        fetchNextPage: fetchNextRequestsPage,
        refetch: refetchRequests,
        hasNextPage: hasNextRequestsPage,
        isFetching: isFetchingRequests,
        data:
          infiniteRequests?.pages.flatMap((page) => page.docs) ||
          Array.from({ length: 5 }, (_, idx) => ({ id: `placeholder-${idx}` })),
      },
      {
        id: 'hospitals',
        title: 'Hospitals',
        isFetchingNextPage: isFetchingNextHospitalsPage,
        isLoading: isLoadingHospitals,
        fetchNextPage: fetchNextHospitalsPage,
        refetch: refetchHospitals,
        hasNextPage: hasNextHospitalsPage,
        isFetching: isFetchingHospitals,
        data:
          infiniteHospitals?.pages.flatMap((page) => page.docs) ||
          Array.from({ length: 5 }, (_, idx) => ({ id: `placeholder-${idx}` })),
      },
      {
        id: 'milk-banks',
        title: 'Milk Banks',
        isFetchingNextPage: isFetchingNextMilkBanksPage,
        isLoading: isLoadingMilkBanks,
        fetchNextPage: fetchNextMilkBanksPage,
        refetch: refetchMilkBanks,
        hasNextPage: hasNextMilkBanksPage,
        isFetching: isFetchingMilkBanks,
        data:
          infiniteMilkBanks?.pages.flatMap((page) => page.docs) ||
          Array.from({ length: 5 }, (_, idx) => ({ id: `placeholder-${idx}` })),
      },
    ];
  }, [
    isFetchingNextDonationsPage,
    isLoadingDonations,
    fetchNextDonationsPage,
    refetchDonations,
    hasNextDonationsPage,
    isFetchingDonations,
    infiniteDonations?.pages,
    isFetchingNextRequestsPage,
    isLoadingRequests,
    fetchNextRequestsPage,
    refetchRequests,
    hasNextRequestsPage,
    isFetchingRequests,
    infiniteRequests?.pages,
    isFetchingNextHospitalsPage,
    isLoadingHospitals,
    fetchNextHospitalsPage,
    refetchHospitals,
    hasNextHospitalsPage,
    isFetchingHospitals,
    infiniteHospitals?.pages,
    isFetchingNextMilkBanksPage,
    isLoadingMilkBanks,
    fetchNextMilkBanksPage,
    refetchMilkBanks,
    hasNextMilkBanksPage,
    isFetchingMilkBanks,
    infiniteMilkBanks?.pages,
  ]);

  const renderItem: ListRenderItem<Data> = useCallback(
    ({ item, extraData: { sectionId, isLoading } }) => {
      if (sectionId === 'donations') {
        if (item.id.includes('placeholder') || isLoading) {
          return <DonationSkeleton />;
        }
        return <DonationCard data={item as Donation} onPress={() => handleChanged(item.id)} />;
      }
      if (sectionId === 'requests') {
        if (item.id.includes('placeholder') || isLoading) {
          return <RequestSkeleton />;
        }
        return <RequestCard data={item as Request} onPress={() => handleChanged(item.id)} />;
      }
      // Add other item renderers for requests, hospitals, milk banks as needed
      return (
        <Card className="aspect-square h-48 p-4">
          <Text>{item.id}</Text>
        </Card>
      );
    },
    [handleChanged]
  );

  return (
    <BottomSheet
      open={open}
      setOpen={setOpen}
      sheetRef={bottomSheetRef}
      disableClose={true}
      snapToIndex={1}
    >
      <BottomSheetPortal
        snapPoints={snapPoints}
        snapToIndex={1}
        handleComponent={(props) => <BottomSheetDragIndicator {...props} className="py-4 shadow" />}
        enablePanDownToClose={false}
        enableContentPanningGesture={false}
        enableDynamicSizing={false}
        animateOnMount={true}
        onChange={(index) => {
          setOpen(index > 0);
        }}
      >
        {selected && slug && (
          <BottomSheetContent>
            <InfoCard data={selected} slug={slug} />
          </BottomSheetContent>
        )}

        {!hasSelectedItem && (
          <BottomSheetScrollView focusHook={useFocusEffect} contentContainerClassName="gap-2 py-3">
            {sections.map((section, index) => {
              const {
                fetchNextPage,
                isFetching,
                isFetchingNextPage,
                isLoading,
                hasNextPage,
                title,
                refetch,
                data,
              } = section;

              if (data.length === 0) {
                return null;
              }

              return (
                <VStack space="sm" key={`section-${section.id}-${index}`}>
                  <Text size="lg" className="font-JakartaMedium px-4">
                    {title}
                  </Text>

                  <Box style={{ height: 256, width: '100%' }}>
                    <BottomSheetFlashList
                      horizontal
                      focusHook={useFocusEffect}
                      data={data}
                      renderItem={renderItem}
                      estimatedItemSize={20}
                      extraData={{ sectionId: section.id, isLoading }}
                      contentContainerStyle={{ paddingHorizontal: 16 }}
                      estimatedListSize={{ width: DEVICE_WIDTH, height: 256 }}
                      keyExtractor={(item, idx) => `${section.title}-${idx}-${item.id}`}
                      ListFooterComponent={
                        isFetchingNextPage ? (
                          <Spinner size="small" className="mx-2 my-auto" />
                        ) : null
                      }
                      ItemSeparatorComponent={() => <Box className="w-4" />}
                      onEndReachedThreshold={0.2}
                      onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
                      refreshControl={
                        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
                      }
                    />
                  </Box>
                </VStack>
              );
            })}
          </BottomSheetScrollView>
        )}
      </BottomSheetPortal>
    </BottomSheet>
  );
}
