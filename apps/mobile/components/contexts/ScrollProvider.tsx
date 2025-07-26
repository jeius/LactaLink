import { createContext, useContext, useRef, useState } from 'react';
import { NativeScrollEvent } from 'react-native';

type ScrollContextType = {
  scrolledDown: boolean;
  event?: NativeScrollEvent;
  onScrollBeginDrag: (event: NativeScrollEvent) => void;
  onScrollEndDrag: (event: NativeScrollEvent) => void;
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

  const [scrolledDown, setScrolledDown] = useState(false);
  const [event, setEvent] = useState<NativeScrollEvent>();

  function onScrollBeginDrag(event: NativeScrollEvent) {
    setEvent(event);
    previousEvent.current = event;
  }

  function onScrollEndDrag(event: NativeScrollEvent) {
    setEvent(event);
    const currentOffset = event.contentOffset.y;
    const previousOffset = previousEvent.current?.contentOffset.y || 0;

    // Determine if scrolled down
    if (currentOffset > previousOffset) {
      setScrolledDown(true);
    } else {
      setScrolledDown(false);
    }

    previousEvent.current = event;
  }

  return (
    <ScrollContext.Provider value={{ scrolledDown, event, onScrollBeginDrag, onScrollEndDrag }}>
      {children}
    </ScrollContext.Provider>
  );
}
