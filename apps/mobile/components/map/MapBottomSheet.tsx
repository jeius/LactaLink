import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef } from 'react';

import GorhomBottomSheet, { BottomSheetFooter, BottomSheetFooterProps } from '@gorhom/bottom-sheet';

import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { BottomSheetVariables } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Donation, Hospital, MilkBank, PaginatedDocs, Request } from '@lactalink/types';
import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { ChevronLeftIcon, CompassIcon, LocateFixedIcon, LocateIcon } from 'lucide-react-native';
import { useMap } from '../contexts/MapProvider';
import { DonateRequestModal } from '../modals';
import { MapBottomSheetTabs } from '../tabs/MapBottomSheetTabs';
import { BottomSheet, BottomSheetPortal, BottomSheetScrollView } from '../ui/bottom-sheet';
import { BottomSheetHandle } from '../ui/BottomSheetHandle';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { VStack } from '../ui/vstack';
import { MapMarkerInfo } from './MapMarkerInfo';

const DEFAULT_SNAP_POINT = 30;

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
}

export function MapBottomSheet({ value: selected, onChange }: MapBottomSheetProps) {
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const {
    mapRef,
    setState,
    state: { followUser, isUserLocated },
  } = useMap();

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
    return [DEFAULT_SNAP_POINT, '40%', '60%', '80%'];
  }, []);

  function handleMinimize() {
    sheetRef.current?.snapToIndex(1);
  }

  function HandleComponent(props: BottomSheetVariables) {
    return (
      <Box className="relative">
        <BottomSheetHandle {...props} />
        <Box className="absolute right-0 top-0 px-4" style={{ transform: [{ translateY: -64 }] }}>
          <Button
            action="info"
            className={`h-14 w-14 rounded-full p-3 ${followUser ? 'bg-info-600' : ''}`}
            onPress={() => setState((prev) => ({ ...prev, locateButtonPressed: true }))}
            accessibilityLabel="Follow user location"
            accessibilityHint="Toggles following the user's current location"
            accessibilityRole="button"
            accessibilityState={{ selected: followUser }}
          >
            <ButtonIcon
              as={followUser ? CompassIcon : isUserLocated ? LocateFixedIcon : LocateIcon}
              height={22}
              width={22}
            />
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <BottomSheet sheetRef={sheetRef} disableClose={true} snapToIndex={1}>
      <BottomSheetPortal
        snapPoints={snapPoints}
        snapToIndex={1}
        handleComponent={HandleComponent}
        enableContentPanningGesture={true}
        enableDynamicSizing={false}
        animateOnMount={true}
        footerComponent={FooterComponent}
        backgroundStyle={{ backgroundColor: 'transparent' }}
      >
        {selected ? (
          <BottomSheetScrollView
            focusHook={useFocusEffect}
            contentContainerClassName="gap-2 bg-background-50 py-3"
          >
            <VStack className="items-start px-5">
              <Button variant="link" onPress={() => handleChanged(undefined)}>
                <ButtonIcon as={ChevronLeftIcon} />
                <ButtonText>Back</ButtonText>
              </Button>
              <MapMarkerInfo mapRef={mapRef} selected={selected} onViewOnMap={handleMinimize} />
            </VStack>
          </BottomSheetScrollView>
        ) : (
          <MapBottomSheetTabs />
        )}
      </BottomSheetPortal>
    </BottomSheet>
  );
}

function FooterComponent(props: BottomSheetFooterProps) {
  return (
    <BottomSheetFooter {...props}>
      <Box className="mt-24 self-end p-5">
        <DonateRequestModal />
      </Box>
    </BottomSheetFooter>
  );
}
