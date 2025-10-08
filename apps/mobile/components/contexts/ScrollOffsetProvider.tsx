import { PropsWithChildren, useEffect } from 'react';
import {
  AnimatedRef,
  SharedValue,
  useAnimatedRef,
  useScrollOffset as useAnimatedScrollOffset,
} from 'react-native-reanimated';
import { WrapperRef } from 'react-native-reanimated/lib/typescript/commonTypes';
import { create } from 'zustand/react';

interface ScrollOffsetState<T extends WrapperRef = WrapperRef> {
  ref: AnimatedRef<T> | null;
  offset: SharedValue<number> | null;
  setRef: (ref: AnimatedRef<T> | null) => void;
  setOffset: (offset: SharedValue<number>) => void;
  reset: () => void;
}

export const useScrollOffsetStore = create<ScrollOffsetState>((set) => ({
  ref: null,
  offset: null,
  setRef: (ref) => set({ ref }),
  setOffset: (offset) => set({ offset }),
  reset: () => set({ ref: null, offset: null }),
}));

type ScrollOffsetContext<T extends WrapperRef> = Pick<ScrollOffsetState<T>, 'ref' | 'offset'>;

export function useScrollOffset<T extends WrapperRef = WrapperRef>(): ScrollOffsetContext<T> {
  const ref = useScrollOffsetStore((state) => state.ref);
  const offset = useScrollOffsetStore((state) => state.offset);
  return { ref, offset } as ScrollOffsetContext<T>;
}

interface ScrollOffsetProviderProps extends PropsWithChildren {
  animatedRef?: AnimatedRef<WrapperRef> | null;
  providedOffset?: SharedValue<number>;
}

export function ScrollOffsetProvider({
  children,
  animatedRef,
  providedOffset,
}: ScrollOffsetProviderProps) {
  const setRef = useScrollOffsetStore((state) => state.setRef);
  const setOffset = useScrollOffsetStore((state) => state.setOffset);
  const reset = useScrollOffsetStore((state) => state.reset);

  const ref = useAnimatedRef<WrapperRef>();
  const offset = useAnimatedScrollOffset(ref, providedOffset);

  useEffect(() => {
    // Set the ref on store
    // Prefer the animatedRef if provided
    if (animatedRef) {
      setRef(animatedRef);
    } else {
      setRef(ref);
    }

    // Set the offset on store
    setOffset(offset);

    // Cleanup on unmount
    return () => reset();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animatedRef]);

  return <>{children}</>;
}
