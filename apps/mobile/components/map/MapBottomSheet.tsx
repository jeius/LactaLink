import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import GorhomBottomSheet from '@gorhom/bottom-sheet';

import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { CollectionSlug, Donation, Hospital, MilkBank, Request } from '@lactalink/types';
import { ListRenderItem } from '@shopify/flash-list';
import { UseQueryResult } from '@tanstack/react-query';
import { ChevronLeftIcon } from 'lucide-react-native';
import { Dimensions } from 'react-native';
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
  queryResult: UseQueryResult<Data[] | null, Error>;
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
  requestQueryResult: UseQueryResult<Request[] | null, Error>;
  donationQueryResult: UseQueryResult<Donation[] | null, Error>;
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
  const [open, setOpen] = useState(true);

  const DEVICE_WIDTH = Dimensions.get('window').width;

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

  function handleGetItemType(item: Data, _idx: number, { slug }: { slug: Slug }): string {
    if (slug === 'donations') {
      const status = (item as Donation).status;
      const volume = (item as Donation).remainingVolume || 0;
      return `donation-${status}-${volume}`;
    }
    if (slug === 'requests') {
      const status = (item as Request).status;
      const volume = (item as Request).volumeNeeded || 0;
      return `request-${status}-${volume}`;
    }
    return 'unknown';
  }

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

  return (
    <BottomSheet
      open={open}
      setOpen={setOpen}
      sheetRef={sheetRef}
      disableClose={true}
      snapToIndex={1}
    >
      <BottomSheetPortal
        snapPoints={snapPoints}
        snapToIndex={1}
        handleComponent={BottomSheetHandle}
        enablePanDownToClose={false}
        enableContentPanningGesture={Boolean(selected)}
        enableDynamicSizing={false}
        animateOnMount={true}
        onChange={(index) => setOpen(index > 0)}
      >
        <BottomSheetScrollView focusHook={useFocusEffect} contentContainerClassName="gap-2 py-3">
          {selected ? (
            <VStack className="items-start px-5">
              <Button variant="link" onPress={() => handleChanged(undefined)}>
                <ButtonIcon as={ChevronLeftIcon} />
                <ButtonText>Back</ButtonText>
              </Button>
              <MapMarkerInfo mapRef={mapRef} selected={selected} />
            </VStack>
          ) : (
            sections.map((section, index) => {
              const { queryResult, slug } = section;
              const { isLoading, data } = queryResult;

              if (data?.length === 0) {
                return null;
              }

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
                      data={data || placeholder}
                      estimatedItemSize={180}
                      renderItem={renderItem}
                      getItemType={handleGetItemType}
                      extraData={{ isLoading, slug }}
                      contentContainerStyle={{ paddingHorizontal: 16 }}
                      estimatedListSize={{ width: DEVICE_WIDTH, height: 256 }}
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
