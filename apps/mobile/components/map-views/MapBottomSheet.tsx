import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler } from 'react-native';

import GorhomBottomSheet from '@gorhom/bottom-sheet';

import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { useApiClient } from '@lactalink/api';
import { CollectionSlug } from '@lactalink/types';
import { useQuery } from '@tanstack/react-query';
import { FlatList } from 'react-native-gesture-handler';
import DonationCard from '../cards/DonationCard';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDragIndicator,
  BottomSheetPortal,
  BottomSheetScrollView,
} from '../ui/bottom-sheet';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const DEFAULT_SNAP_POINT = 33;

export interface MapBottomSheetProps {
  id?: string;
  slug?: Extract<CollectionSlug, 'donations' | 'requests' | 'hospitals' | 'milkBanks'>;
}

export function MapBottomSheet({ id, slug }: MapBottomSheetProps) {
  const bottomSheetRef = useRef<GorhomBottomSheet>(null);
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const apiClient = useApiClient();

  const hasSelectedItem = Boolean(id && slug);
  const snapPoints = useMemo(
    () => (hasSelectedItem ? [DEFAULT_SNAP_POINT] : [DEFAULT_SNAP_POINT, '40%', '60%', '80%']),
    [hasSelectedItem]
  );

  const { data, isLoading, isFetching } = useQuery({
    enabled: hasSelectedItem,
    initialData: null,
    queryKey: ['map-bottom-sheet', id, slug],
    queryFn: () => (id && slug && apiClient.findByID({ id, collection: slug, depth: 3 })) || null,
  });

  const {
    data: infiniteDonations,
    fetchNextPage: fetchNextDonationsPage,
    hasNextPage: hasNextDonationsPage,
  } = useInfiniteFetchBySlug('donations', !hasSelectedItem);

  const {
    data: infiniteRequests,
    fetchNextPage: fetchNextRequestsPage,
    hasNextPage: hasNextRequestsPage,
  } = useInfiniteFetchBySlug('requests', !hasSelectedItem);

  const backAction = useCallback(() => {
    if (sheetExpanded) {
      bottomSheetRef.current?.collapse();
      return true; // Prevent default back button behavior
    }
    return false;
  }, [sheetExpanded]);

  useEffect(() => {
    // Add the back button listener
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    // Cleanup the listener on unmount
    return () => backHandler.remove();
  }, [backAction]);

  return (
    <BottomSheet sheetRef={bottomSheetRef} disableClose={true} snapToIndex={1}>
      <BottomSheetPortal
        snapPoints={snapPoints}
        snapToIndex={1}
        handleComponent={BottomSheetDragIndicator}
        enablePanDownToClose={false}
        enableDynamicSizing={hasSelectedItem}
        animateOnMount={true}
        onChange={(index) => {
          setSheetExpanded(index > 0);
        }}
      >
        {hasSelectedItem && (
          <BottomSheetContent>
            <Card></Card>
          </BottomSheetContent>
        )}

        {!hasSelectedItem && (
          <BottomSheetScrollView>
            <VStack className="md">
              <Text size="md" className="font-JakartaMedium px-3 py-2">
                Available Donations
              </Text>

              <FlatList
                horizontal
                data={infiniteDonations?.pages.flatMap((page) => page.docs) || []}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <Box className="w-5" />}
                renderItem={({ item }) => <DonationCard data={item} />}
                contentContainerStyle={{ padding: 16, paddingTop: 0 }}
              />

              <Text size="md" className="font-JakartaMedium px-3 py-2">
                Available Donations
              </Text>

              <FlatList
                horizontal
                data={infiniteDonations?.pages.flatMap((page) => page.docs) || []}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <Box className="w-5" />}
                renderItem={({ item }) => <DonationCard data={item} />}
                contentContainerStyle={{ padding: 16, paddingTop: 0 }}
              />

              <Text size="md" className="font-JakartaMedium px-3 py-2">
                Available Donations
              </Text>

              <FlatList
                horizontal
                data={infiniteDonations?.pages.flatMap((page) => page.docs) || []}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <Box className="w-5" />}
                renderItem={({ item }) => <DonationCard data={item} />}
                contentContainerStyle={{ padding: 16, paddingTop: 0 }}
              />
            </VStack>
          </BottomSheetScrollView>
        )}
      </BottomSheetPortal>
    </BottomSheet>
  );
}
