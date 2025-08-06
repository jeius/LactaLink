import { createContext, useCallback, useContext, useRef } from 'react';
import { NativeScrollEvent } from 'react-native';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

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
