import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef } from 'react';

import GorhomBottomSheet from '@gorhom/bottom-sheet';

import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { Donation, Hospital, MilkBank, PaginatedDocs, Request } from '@lactalink/types';
import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { ChevronLeftIcon } from 'lucide-react-native';
import MapView from 'react-native-maps';
import { DonationsRequestsTab } from '../tabs/DonationsRequestsTab';
import { BottomSheet, BottomSheetPortal, BottomSheetScrollView } from '../ui/bottom-sheet';
import { BottomSheetHandle } from '../ui/BottomSheetHandle';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { VStack } from '../ui/vstack';
import { MapMarkerInfo } from './MapMarkerInfo';

const DEFAULT_SNAP_POINT = 28;

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

export function MapBottomSheet({ value: selected, onChange, mapRef }: MapBottomSheetProps) {
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
    return [DEFAULT_SNAP_POINT, '50%', '70%', '90%'];
  }, []);

  function handleMinimize() {
    sheetRef.current?.snapToIndex(1);
  }

  return (
    <BottomSheet sheetRef={sheetRef} disableClose={true} snapToIndex={1}>
      <BottomSheetPortal
        snapPoints={snapPoints}
        snapToIndex={1}
        handleComponent={BottomSheetHandle}
        enableContentPanningGesture={true}
        enableDynamicSizing={false}
        animateOnMount={true}
      >
        {selected ? (
          <BottomSheetScrollView focusHook={useFocusEffect} contentContainerClassName="gap-2 py-3">
            <VStack className="items-start px-5">
              <Button variant="link" onPress={() => handleChanged(undefined)}>
                <ButtonIcon as={ChevronLeftIcon} />
                <ButtonText>Back</ButtonText>
              </Button>
              <MapMarkerInfo mapRef={mapRef} selected={selected} onViewOnMap={handleMinimize} />
            </VStack>
          </BottomSheetScrollView>
        ) : (
          <DonationsRequestsTab />
        )}
      </BottomSheetPortal>
    </BottomSheet>
  );
}
