import { createContext, useCallback, useContext, useRef } from 'react';
import type { NativeScrollEvent } from 'react-native';
import {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScrollDirection = 'up' | 'down';

type ScrollEvent = { nativeEvent: NativeScrollEvent };

type ScrollContextType = {
  scrollValue: SharedValue<number>;
  scrollDirection: SharedValue<ScrollDirection | null>;
  onScrollBeginDrag: (event: ScrollEvent) => void;
  onScrollEndDrag: (event: ScrollEvent) => void;
  onScroll: (event: ScrollEvent) => void;
};

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function useScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }

  return context;
}

export function useScrollHandlers() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollHandlers must be used within a ScrollProvider');
  }

  const { onScrollBeginDrag, onScrollEndDrag, onScroll } = context;
  return { onScrollBeginDrag, onScrollEndDrag, onScroll };
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const methods = useScrollAnimationMethods();

  return <ScrollContext.Provider value={methods}>{children}</ScrollContext.Provider>;
}

type HideOnScrollOptions = {
  animateDistance?: number;
  deltaThreshold?: number;
  animationDirection?: 'up' | 'down' | 'left' | 'right';
};

export function useHideOnScrollAnimation(
  scrollValue: SharedValue<number>,
  {
    animateDistance: animDist,
    deltaThreshold = 20,
    animationDirection = 'down',
  }: HideOnScrollOptions = {}
) {
  const insets = useSafeAreaInsets();

  const animateDistance = animDist || insets.bottom + 60;

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  return useAnimatedStyle(() => {
    const delta = scrollValue?.value ?? 0;
    // Only animate if delta is more than 20 (positive or negative)
    const shouldAnimate = Math.abs(delta) >= deltaThreshold;

    // Clamp delta for interpolation
    const clampedDelta = Math.max(-animateDistance, Math.min(delta, animateDistance));

    switch (animationDirection) {
      case 'down':
        translateY.value = withTiming(
          shouldAnimate
            ? interpolate(
                clampedDelta,
                [-animateDistance, 0, animateDistance],
                [0, 0, animateDistance]
              )
            : 0,
          { duration: 150 }
        );
        break;

      case 'up':
        translateY.value = withTiming(
          shouldAnimate
            ? interpolate(
                clampedDelta,
                [animateDistance, 0, -animateDistance],
                [0, 0, animateDistance]
              )
            : 0,
          { duration: 150 }
        );
        break;

      case 'left':
        translateX.value = withTiming(
          shouldAnimate
            ? interpolate(
                clampedDelta,
                [animateDistance, 0, -animateDistance],
                [0, 0, animateDistance]
              )
            : 0,
          { duration: 150 }
        );
        break;

      case 'right':
        translateX.value = withTiming(
          shouldAnimate
            ? interpolate(
                clampedDelta,
                [-animateDistance, 0, animateDistance],
                [0, 0, animateDistance]
              )
            : 0,
          { duration: 150 }
        );
        break;

      default:
        break;
    }

    opacity.value = withTiming(
      shouldAnimate
        ? interpolate(clampedDelta, [-animateDistance, 0, animateDistance], [1, 1, 0])
        : 1,
      { duration: 300 }
    );

    return {
      transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
      opacity: opacity.value,
    };
  });
}

export function useScrollAnimationMethods() {
  const previousEvent = useRef<NativeScrollEvent>(null);
  const previousDirection = useRef<ScrollDirection | null>(null);
  const accumulatedDelta = useRef(0);

  const scrollValue = useSharedValue(0);
  const scrollDirection = useSharedValue<ScrollDirection | null>(null);

  const onScrollBeginDrag = useCallback((event: ScrollEvent) => {
    previousEvent.current = event.nativeEvent;
  }, []);

  const onScrollEndDrag = useCallback((event: ScrollEvent) => {
    previousEvent.current = event.nativeEvent;
  }, []);

  const onScroll = useCallback(
    ({ nativeEvent: event }: ScrollEvent) => {
      const currentOffset = event.contentOffset.y;
      const previousOffset = previousEvent.current?.contentOffset.y || 0;
      const delta = currentOffset - previousOffset;

      // Determine direction
      const direction = delta > 0 ? 'down' : delta < 0 ? 'up' : previousDirection.current;
      scrollDirection.value = direction;

      // If direction changes, reset accumulated delta
      if (direction !== previousDirection.current) {
        accumulatedDelta.current = 0;
      }

      accumulatedDelta.current += delta;
      previousDirection.current = direction;

      // Only update scrollValue if abs(accumulatedDelta) >= 100
      if (Math.abs(accumulatedDelta.current) >= 100) {
        scrollValue.value = accumulatedDelta.current;
      } else {
        scrollValue.value = 0;
      }

      previousEvent.current = event;
    },
    [scrollDirection, scrollValue]
  );

  return { scrollValue, scrollDirection, onScrollBeginDrag, onScrollEndDrag, onScroll };
}
