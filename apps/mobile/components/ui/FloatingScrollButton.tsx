import { shadow } from '@/lib/utils/shadows';
import { BottomSheetScrollViewMethods } from '@gorhom/bottom-sheet';
import { ChevronUpIcon } from 'lucide-react-native';
import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { NativeScrollEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedPressable } from '../animated/pressable';
import { Box } from './box';
import { Icon } from './icon';

interface FloatingScrollButtonProps {
  scrollViewRef: RefObject<ScrollView | BottomSheetScrollViewMethods | null>;
  scrollEvent?: NativeScrollEvent;
}

export function FloatingScrollButton({ scrollViewRef, scrollEvent }: FloatingScrollButtonProps) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  const animatedOpacity = useSharedValue(1);
  const animatedRotation = useSharedValue(180); // Start with down arrow

  // Use refs to avoid flickering from rapid state updates
  const lastScrollDirection = useRef<'up' | 'down'>('down');
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  //#region scroll handling
  const updateScrollState = useCallback(
    (canScrollUpNow: boolean, canScrollDownNow: boolean, direction: 'up' | 'down') => {
      setCanScrollUp(canScrollUpNow);
      setCanScrollDown(canScrollDownNow);
      setScrollDirection(direction);
    },
    []
  );

  const handleScroll = useCallback(
    (event: NativeScrollEvent) => {
      'worklet';

      const { contentOffset, contentSize, layoutMeasurement } = event;
      const scrollY = contentOffset.y;
      const scrollHeight = contentSize.height;
      const viewHeight = layoutMeasurement.height;

      // Check scroll capabilities
      const canScrollUpNow = scrollY > 20;
      const canScrollDownNow = scrollY < scrollHeight - viewHeight - 20;

      // Clear any existing hide timeout
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }

      // Show button when scrolling
      animatedOpacity.value = withTiming(1, { duration: 150 });

      let newDirection: 'up' | 'down' = lastScrollDirection.current;

      // Simple logic: only change direction when at start or end
      if (!canScrollUpNow && canScrollDownNow) {
        // At top, can only scroll down
        newDirection = 'down';
        animatedRotation.value = withSpring(180, { damping: 15, stiffness: 150 });
      } else if (canScrollUpNow && !canScrollDownNow) {
        // At bottom, can only scroll up
        newDirection = 'up';
        animatedRotation.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
      // If in middle (canScrollUpNow && canScrollDownNow), keep current direction

      // Only update state if direction actually changed
      if (newDirection !== lastScrollDirection.current) {
        lastScrollDirection.current = newDirection;
        runOnJS(updateScrollState)(canScrollUpNow, canScrollDownNow, newDirection);
      }

      // Hide button after inactivity
      hideTimeout.current = setTimeout(() => {
        animatedOpacity.value = withTiming(0.6, { duration: 300 });
      }, 1500);
    },
    [animatedOpacity, animatedRotation, updateScrollState]
  );

  useEffect(() => {
    if (scrollEvent) {
      handleScroll(scrollEvent);
    }
  }, [handleScroll, scrollEvent]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, []);
  //#endregion

  //#region styles
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${animatedRotation.value}deg`,
      },
    ],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value,
  }));
  //#endregion

  //#region callbacks
  const handleArrowPress = useCallback(() => {
    if (!scrollViewRef.current) return;

    // Show button immediately when pressed
    animatedOpacity.value = withTiming(1, { duration: 100 });

    if (scrollDirection === 'up') {
      scrollViewRef.current.scrollTo({
        y: 0,
        animated: true,
      });
    } else {
      scrollViewRef.current.scrollToEnd({
        animated: true,
      });
    }
  }, [scrollDirection, scrollViewRef, animatedOpacity]);
  //#endregion

  // Don't show button if can't scroll in any direction
  if (!canScrollUp && !canScrollDown) {
    return null;
  }

  return (
    <AnimatedPressable onPress={handleArrowPress} style={containerStyle}>
      <Box
        className="bg-secondary-500 h-14 w-14 items-center justify-center rounded-full p-3"
        style={shadow.md}
      >
        <Animated.View style={arrowStyle}>
          <Icon as={ChevronUpIcon} size="lg" className="text-secondary-0" />
        </Animated.View>
      </Box>
    </AnimatedPressable>
  );
}
