import React, { PropsWithChildren, useState } from 'react';

import { BottomSheetFooter, BottomSheetFooterProps } from '@gorhom/bottom-sheet';

import { Layout } from '@react-navigation/elements';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { LocateButton } from '../buttons/LocateButton';
import { DonateRequestModal } from '../modals';
import { BottomSheet, BottomSheetPortal } from '../ui/bottom-sheet';
import { BottomSheetHandle, HANDLEHEIGHT } from '../ui/BottomSheetHandle';
import { Box } from '../ui/box';

const snapPoints = [HANDLEHEIGHT, '50%', '100%'];

interface MapBottomSheetProps extends PropsWithChildren {
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
  children,
}: MapBottomSheetProps) {
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

  return (
    <Box className="flex-1" onLayout={(e) => setBoxSize(e.nativeEvent.layout)}>
      <Animated.View className="absolute right-4 top-0" style={animatedBtnStyle}>
        <LocateButton onLayout={(e) => setBtnSize(e.nativeEvent.layout)} />
      </Animated.View>

      <BottomSheet disableClose={true} snapToIndex={1}>
        <BottomSheetPortal
          snapPoints={snapPoints}
          handleComponent={BottomSheetHandle}
          enableContentPanningGesture={true}
          enableDynamicSizing={false}
          animateOnMount={true}
          footerComponent={FooterComponent}
          enableOverDrag={false}
          animatedPosition={positionProgress}
          animatedIndex={snapPointProgress}
          disableCollapseOnBackPress={true}
        >
          {children}
        </BottomSheetPortal>
      </BottomSheet>
    </Box>
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
