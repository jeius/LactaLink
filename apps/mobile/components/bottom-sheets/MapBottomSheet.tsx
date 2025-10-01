import { useFocusEffect } from '@react-navigation/native';
import React, { useRef } from 'react';

import GorhomBottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollViewMethods,
} from '@gorhom/bottom-sheet';

import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { setSelectedMarker, useMarkersStore } from '@/lib/stores/markersStore';
import { BottomSheetVariables } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Motion } from '@legendapp/motion';
import { ChevronLeftIcon } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native';
import { LocateButton } from '../buttons/LocateButton';
import { MapMarkerInfo } from '../map/MapMarkerInfo';
import { DonateRequestModal } from '../modals';
import { MapBottomSheetTabs } from '../tabs/MapBottomSheetTabs';
import { BottomSheet, BottomSheetPortal, BottomSheetScrollView } from '../ui/bottom-sheet';
import { BottomSheetHandle } from '../ui/BottomSheetHandle';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { VStack } from '../ui/vstack';

const DEFAULT_SNAP_POINT = 30;
const snapPoints = [DEFAULT_SNAP_POINT, '40%', '60%', '80%'];

export function MapBottomSheet() {
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const sheetScrollRef = useRef<BottomSheetScrollViewMethods>(null);
  const { width } = useWindowDimensions();

  const selectedMarker = useMarkersStore((s) => s.selectedMarker);

  usePreventBackPress(Boolean(selectedMarker), () => {
    unselectMarker();
  });

  function handleMinimize() {
    sheetRef.current?.snapToIndex(1);
    sheetScrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function unselectMarker() {
    setSelectedMarker(null);
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
        <Motion.View
          animate={{ x: selectedMarker ? -width : 0 }}
          className="bg-background-50 flex-1 flex-row justify-start"
          style={{ width: width * 2 }}
        >
          <Box className="flex-1">
            <MapBottomSheetTabs />
          </Box>

          <BottomSheetScrollView
            ref={sheetScrollRef}
            focusHook={useFocusEffect}
            contentContainerClassName="gap-2 py-3"
            className="flex-1"
          >
            <VStack className="items-start px-5">
              <Button variant="link" onPress={unselectMarker}>
                <ButtonIcon as={ChevronLeftIcon} />
                <ButtonText>Back</ButtonText>
              </Button>
              <MapMarkerInfo onViewOnMap={handleMinimize} />
            </VStack>
          </BottomSheetScrollView>
        </Motion.View>
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

function HandleComponent(props: BottomSheetVariables) {
  return (
    <Box className="relative">
      <BottomSheetHandle {...props} />
      <Box className="absolute right-0 top-0 px-4" style={{ transform: [{ translateY: -64 }] }}>
        <LocateButton />
      </Box>
    </Box>
  );
}
