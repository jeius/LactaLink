import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import GorhomBottomSheet from '@gorhom/bottom-sheet';

import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import {
  CollectionSlug,
  Donation,
  Hospital,
  MilkBank,
  PaginatedDocs,
  Request,
} from '@lactalink/types';
import { ListRenderItem } from '@shopify/flash-list';
import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { ChevronLeftIcon } from 'lucide-react-native';
import MapView from 'react-native-maps';
import DonationCard from '../cards/DonationCard';
import RequestCard from '../cards/RequestCard';
import {
  BottomSheet,
  BottomSheetFlashList,
  BottomSheetPortal,
  BottomSheetScrollView,
} from '../ui/bottom-sheet';
import { BottomSheetHandle } from '../ui/BottomSheetHandle';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';
import { MapMarkerInfo } from './MapMarkerInfo';

const DEFAULT_SNAP_POINT = 28;

type Slug = Extract<CollectionSlug, 'donations' | 'requests' | 'hospitals' | 'milkBanks'>;

type Data = Donation | Request | MilkBank | Hospital | { id: string };

type Section = {
  slug: Slug;
  title: string;
  queryResult: UseInfiniteQueryResult<InfiniteData<PaginatedDocs<Data> | null>>;
};

type Value =
  | { slug: 'donations'; data: Donation }
  | { slug: 'requests'; data: Request }
  | { slug: 'hospitals'; data: Hospital }
  | { slug: 'milkBanks'; data: MilkBank }
  | { slug: 'placeholder'; data: { id: string } };

export interface MapBottomSheetProps {
  value?: Value | null;
  onChange?: (id?: Value) => void;
  requestQueryResult: UseInfiniteQueryResult<InfiniteData<PaginatedDocs<Request> | null>>;
  donationQueryResult: UseInfiniteQueryResult<InfiniteData<PaginatedDocs<Donation> | null>>;
  mapRef?: React.RefObject<MapView | null>;
}

export function MapBottomSheet({
  value: selected,
  onChange,
  donationQueryResult,
  requestQueryResult,
  mapRef,
}: MapBottomSheetProps) {
  const sheetRef = useRef<GorhomBottomSheet>(null);

  const hasSelectedItem = Boolean(selected);

  usePreventBackPress(hasSelectedItem, () => {
    handleChanged(undefined);
  });

  const handleChanged = useCallback(
    (val?: Value) => {
      onChange?.(val);
    },
    [onChange]
  );

  const snapPoints = useMemo(() => {
    return hasSelectedItem ? [DEFAULT_SNAP_POINT, '45%', '80%'] : [DEFAULT_SNAP_POINT, 320];
  }, [hasSelectedItem]);

  const sections = useMemo((): Section[] => {
    return [
      {
        slug: 'donations',
        title: 'Available Donations',
        queryResult: donationQueryResult,
      },
      {
        slug: 'requests',
        title: 'Available Requests',
        queryResult: requestQueryResult,
      },
    ];
  }, [donationQueryResult, requestQueryResult]);

  const renderItem: ListRenderItem<Data> = useCallback(
    ({ item, extraData: { slug, isLoading } }) => {
      const loading = isLoading || item.id.includes('placeholder');

      if (slug === 'donations') {
        return (
          <DonationCard
            isLoading={loading}
            data={item as Donation}
            onPress={() => handleChanged({ data: item, slug })}
          />
        );
      }

      if (slug === 'requests') {
        return (
          <RequestCard
            isLoading={loading}
            data={item as Request}
            onPress={() => handleChanged({ data: item, slug })}
          />
        );
      }

      return null;
    },
    [handleChanged]
  );

  useEffect(() => {
    setTimeout(() => {
      sheetRef.current?.snapToIndex(snapPoints.length - 1);
    }, 20); // Delay to ensure the sheet is mounted before snapping
  }, [snapPoints.length]);

  function handleMinimize() {
    sheetRef.current?.snapToIndex(1);
  }

  return (
    <BottomSheet sheetRef={sheetRef} disableClose={true} snapToIndex={1}>
      <BottomSheetPortal
        snapPoints={snapPoints}
        snapToIndex={1}
        handleComponent={BottomSheetHandle}
        enableContentPanningGesture={Boolean(selected)}
        enableDynamicSizing={false}
        animateOnMount={true}
      >
        <BottomSheetScrollView focusHook={useFocusEffect} contentContainerClassName="gap-2 py-3">
          {selected ? (
            <VStack className="items-start px-5">
              <Button variant="link" onPress={() => handleChanged(undefined)}>
                <ButtonIcon as={ChevronLeftIcon} />
                <ButtonText>Back</ButtonText>
              </Button>
              <MapMarkerInfo mapRef={mapRef} selected={selected} onViewOnMap={handleMinimize} />
            </VStack>
          ) : (
            sections.map((section, index) => {
              const { queryResult, slug } = section;
              const { isLoading, data } = queryResult;
              console.log('section data', data);
              const flattenedData =
                data?.pages.flatMap((page) => page?.docs).filter((v) => v !== undefined) || [];

              const placeholder = Array.from({ length: 5 }, (_, idx) => ({
                id: `placeholder-${slug}-${idx}`,
              }));

              return (
                <VStack space="sm" key={`section-${slug}-${index}`}>
                  <Text size="lg" className="font-JakartaMedium px-4">
                    {section.title}
                  </Text>

                  <Box style={{ height: 256, width: '100%' }}>
                    <BottomSheetFlashList
                      horizontal
                      data={isLoading ? flattenedData : placeholder}
                      renderItem={renderItem}
                      extraData={{ isLoading, slug }}
                      contentContainerStyle={{ paddingHorizontal: 16 }}
                      keyExtractor={(item, idx) => `${section.title}-${idx}-${item.id}`}
                      ItemSeparatorComponent={() => <Box className="w-4" />}
                    />
                  </Box>
                </VStack>
              );
            })
          )}
        </BottomSheetScrollView>
      </BottomSheetPortal>
    </BottomSheet>
  );
}
