import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import GorhomBottomSheet from '@gorhom/bottom-sheet';

import { CollectionSlug, Donation, Hospital, MilkBank, Request } from '@lactalink/types';
import { ListRenderItem } from '@shopify/flash-list';
import { UseQueryResult } from '@tanstack/react-query';
import { ChevronLeftIcon } from 'lucide-react-native';
import { Dimensions } from 'react-native';
import DonationCard, { DonationSkeleton } from '../cards/DonationCard';
import InfoCard from '../cards/InfoCard';
import RequestCard, { RequestSkeleton } from '../cards/RequestCard';
import { RefreshControl } from '../RefreshControl';
import {
  BottomSheet,
  BottomSheetDragIndicator,
  BottomSheetFlashList,
  BottomSheetPortal,
  BottomSheetScrollView,
} from '../ui/bottom-sheet';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const DEFAULT_SNAP_POINT = 30;

type Slug = Extract<CollectionSlug, 'donations' | 'requests' | 'hospitals' | 'milkBanks'>;

type Data = Donation | Request | MilkBank | Hospital | { id: string };
type Section = {
  slug: Slug;
  title: string;
  queryResult: UseQueryResult<Data[] | null, Error>;
};

type Value = {
  data: Data;
  slug: Slug;
};

export interface MapBottomSheetProps {
  value?: Value | null;
  onChange?: (id?: Value) => void;
  requestQueryResult: UseQueryResult<Request[] | null, Error>;
  donationQueryResult: UseQueryResult<Donation[] | null, Error>;
}

export function MapBottomSheet({
  value: selected,
  onChange,
  donationQueryResult,
  requestQueryResult,
}: MapBottomSheetProps) {
  const bottomSheetRef = useRef<GorhomBottomSheet>(null);
  const [open, setOpen] = useState(true);

  const DEVICE_WIDTH = Dimensions.get('window').width;

  const hasSelectedItem = Boolean(selected);

  console.log('MapBottomSheet Rendered');

  const handleChanged = useCallback(
    (val?: Value) => {
      onChange?.(val);
    },
    [onChange]
  );

  const snapPoints = hasSelectedItem
    ? [DEFAULT_SNAP_POINT, '40%']
    : [DEFAULT_SNAP_POINT, 320, '82%'];

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
        return loading ? (
          <DonationSkeleton />
        ) : (
          <DonationCard
            data={item as Donation}
            onPress={() => handleChanged({ data: item, slug })}
          />
        );
      }

      if (slug === 'requests') {
        return loading ? (
          <RequestSkeleton />
        ) : (
          <RequestCard data={item as Request} onPress={() => handleChanged({ data: item, slug })} />
        );
      }

      return null;
    },
    [handleChanged]
  );

  function RefreshComponent() {
    const isRefreshing = donationQueryResult.isFetching || requestQueryResult.isFetching;
    const onRefresh = () => {
      if (!selected) {
        donationQueryResult.refetch();
        requestQueryResult.refetch();
      }
    };
    return <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />;
  }

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
        <BottomSheetScrollView
          refreshControl={<RefreshComponent />}
          focusHook={useFocusEffect}
          contentContainerClassName="gap-2 py-3"
          onContentSizeChange={() => bottomSheetRef.current?.snapToIndex(1)}
        >
          {selected && (
            <VStack className="items-start px-5">
              <Button variant="link" onPress={() => handleChanged(undefined)}>
                <ButtonIcon as={ChevronLeftIcon} />
                <ButtonText>Back</ButtonText>
              </Button>
              <InfoCard {...selected} />
            </VStack>
          )}

          {!selected &&
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
            })}
        </BottomSheetScrollView>
      </BottomSheetPortal>
    </BottomSheet>
  );
}
