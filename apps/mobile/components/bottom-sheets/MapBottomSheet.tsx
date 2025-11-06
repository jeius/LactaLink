import React, { useRef, useState } from 'react';

import GorhomBottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollViewMethods,
} from '@gorhom/bottom-sheet';

import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { setSelectedMarker, useMarkersStore } from '@/lib/stores/markersStore';
import { Motion } from '@legendapp/motion';
import { Layout } from '@react-navigation/elements';
import { ChevronLeftIcon } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { LocateButton } from '../buttons/LocateButton';
import { MapMarkerInfo } from '../map/MapMarkerInfo';
import { DonateRequestModal } from '../modals';
import { MapBottomSheetTabs } from '../tabs/MapBottomSheetTabs';
import { BottomSheet, BottomSheetPortal, BottomSheetScrollView } from '../ui/bottom-sheet';
import { BottomSheetHandle, HANDLEHEIGHT } from '../ui/BottomSheetHandle';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { VStack } from '../ui/vstack';

const snapPoints = [HANDLEHEIGHT, '50%', '100%'];

interface MapBottomSheetProps {
  /**
   * If true, shows a loading state on the form fields.
   */
  isLoading?: boolean;

  positionProgress?: SharedValue<number>;
  snapPointProgress?: SharedValue<number>;
}

export function MapBottomSheet({
  positionProgress: positionProp,
  snapPointProgress,
}: MapBottomSheetProps) {
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const sheetScrollRef = useRef<BottomSheetScrollViewMethods>(null);

  const { width } = useWindowDimensions();
  const [boxSize, setBoxSize] = useState<Layout>({ width: 0, height: 0 });
  const [btnSize, setBtnSize] = useState<Layout>({ width: 40, height: 40 });

  const localPositionProgress = useSharedValue(0);
  const positionProgress = positionProp ?? localPositionProgress;

  const animatedBtnStyle = useAnimatedStyle(() => {
    const middlePos = boxSize.height * 0.5;
    const translateY = Math.max(
      positionProgress.value - HANDLEHEIGHT - btnSize.height,
      middlePos - btnSize.height - 20
    );
    return { transform: [{ translateY }] };
  });

  const selectedMarker = useMarkersStore((s) => s.selectedMarker);

  function handleMinimize() {
    sheetRef.current?.snapToIndex(1);
    sheetScrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function unselectMarker() {
    setSelectedMarker(null);
  }

  return (
    <>
      <PreventBack enabled={!!selectedMarker} />

      <Box className="flex-1" onLayout={(e) => setBoxSize(e.nativeEvent.layout)}>
        <Animated.View className="absolute right-4 top-0" style={animatedBtnStyle}>
          <LocateButton onLayout={(e) => setBtnSize(e.nativeEvent.layout)} />
        </Animated.View>

        <BottomSheet sheetRef={sheetRef} disableClose={true} snapToIndex={1}>
          <BottomSheetPortal
            snapPoints={snapPoints}
            snapToIndex={1}
            handleComponent={BottomSheetHandle}
            enableContentPanningGesture={true}
            enableDynamicSizing={false}
            animateOnMount={true}
            footerComponent={FooterComponent}
            backgroundStyle={{ backgroundColor: 'transparent' }}
            enableOverDrag={false}
            animatedPosition={positionProgress}
            animatedIndex={snapPointProgress}
          >
            <Motion.View
              animate={{ x: selectedMarker ? -width : 0 }}
              className="flex-1 flex-row justify-start bg-background-50"
              style={{ width: width * 2 }}
            >
              <Box className="flex-1">
                <MapBottomSheetTabs />
              </Box>

              <BottomSheetScrollView
                ref={sheetScrollRef}
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
      </Box>
    </>
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

function PreventBack({ enabled, callBack }: { enabled: boolean; callBack?: () => void }) {
  usePreventBackPress(enabled, callBack);
  return null;
}
