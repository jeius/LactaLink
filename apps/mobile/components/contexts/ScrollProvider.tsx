import { createContext, useCallback, useContext, useRef } from 'react';
import { NativeScrollEvent } from 'react-native';
import {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScrollContextType = {
  scrollValue: SharedValue<number>;
  onScrollBeginDrag: (event: NativeScrollEvent) => void;
  onScrollEndDrag: (event: NativeScrollEvent) => void;
  onScroll: (event: NativeScrollEvent) => void;
};

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function useScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }

  return context;
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const previousEvent = useRef<NativeScrollEvent>(null);
  const previousDirection = useRef<'up' | 'down' | null>(null);
  const accumulatedDelta = useRef(0);

  const scrollValue = useSharedValue(0);

  const onScrollBeginDrag = useCallback((event: NativeScrollEvent) => {
    previousEvent.current = event;
  }, []);

  const onScrollEndDrag = useCallback((event: NativeScrollEvent) => {
    previousEvent.current = event;
  }, []);

  const onScroll = useCallback(
    (event: NativeScrollEvent) => {
      const currentOffset = event.contentOffset.y;
      const previousOffset = previousEvent.current?.contentOffset.y || 0;
      const delta = currentOffset - previousOffset;

      // Determine direction
      const direction = delta > 0 ? 'down' : delta < 0 ? 'up' : previousDirection.current;

      // If direction changes, reset accumulated delta
      if (direction !== previousDirection.current) {
        accumulatedDelta.current = 0;
      }

      accumulatedDelta.current += delta;
      previousDirection.current = direction;

      // Only update scrollValue if abs(accumulatedDelta) >= 100
      if (Math.abs(accumulatedDelta.current) >= 100) {
        scrollValue.set(accumulatedDelta.current);
      } else {
        scrollValue.set(0);
      }

      previousEvent.current = event;
    },
    [scrollValue]
  );

  return (
    <ScrollContext.Provider value={{ scrollValue, onScrollBeginDrag, onScroll, onScrollEndDrag }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useHideOnScrollAnimation({
  animateDistance: animDist,
  deltaThreshold = 20,
}: { animateDistance?: number; deltaThreshold?: number } = {}) {
  const { scrollValue } = useScroll();
  const insets = useSafeAreaInsets();

  const animateDistance = animDist || insets.bottom + 60;

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  return useAnimatedStyle(() => {
    const delta = scrollValue?.value ?? 0;
    // Only animate if delta is more than 20 (positive or negative)
    const shouldAnimate = Math.abs(delta) >= deltaThreshold;

    // Clamp delta for interpolation
    const clampedDelta = Math.max(-animateDistance, Math.min(delta, animateDistance));

    // Animate translateY and opacity with timing
    translateY.value = withTiming(
      shouldAnimate
        ? interpolate(clampedDelta, [-animateDistance, 0, animateDistance], [0, 0, animateDistance])
        : 0,
      { duration: 150 }
    );
    opacity.value = withTiming(
      shouldAnimate
        ? interpolate(clampedDelta, [-animateDistance, 0, animateDistance], [1, 1, 0])
        : 1,
      { duration: 300 }
    );

    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });
}
