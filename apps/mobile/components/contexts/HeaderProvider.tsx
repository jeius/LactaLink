import { useHideOnScrollDownAnimation } from '@/hooks/animations/useHideOnScrollDownAnimation';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { LayoutRectangle } from 'react-native';
import { ScrollHandlerProcessed, SharedValue, useSharedValue } from 'react-native-reanimated';
import { createStore, StoreApi, useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';

type ScrollHandler = ScrollHandlerProcessed<Record<string, unknown>>;

interface HeaderStore {
  size: LayoutRectangle;
  visible: boolean;
  translateProgress: SharedValue<number>;
  opacityProgress: SharedValue<number>;
  scrollHandler?: ScrollHandler;
  actions: {
    setSize: (size: LayoutRectangle) => void;
    setVisible: (visible: boolean) => void;
  };
}

const HeaderContext = createContext<StoreApi<HeaderStore> | null>(null);

export const useHeaderSize = () => useHeaderStore((state) => state.size);

export function useHeader<T>(selector?: (state: HeaderStore) => T) {
  return useHeaderStore(useShallow(selector ?? ((state) => state as T)));
}

export const useHeaderScrollHandler = () => useHeaderStore((state) => state.scrollHandler);

export function useHeaderProgress() {
  const translateY = useHeaderStore((state) => state.translateProgress);
  const opacity = useHeaderStore((state) => state.opacityProgress);
  return { translateY, opacity };
}

export const useHeaderActions = () => useHeaderStore((state) => state.actions);

export function HeaderProvider({ children }: PropsWithChildren) {
  const translateProgress = useSharedValue(0);
  const opacityProgress = useSharedValue(1);

  const [store] = useState(() =>
    createStore<HeaderStore>((set) => ({
      size: { height: 0, width: 0, x: 0, y: 0 },
      visible: true,
      translateProgress,
      opacityProgress,
      actions: {
        setSize: (size) => set(() => ({ size })),
        setVisible: (visible: boolean) => set(() => ({ visible })),
      },
    }))
  );

  const { height } = useStore(store, (state) => state.size);

  const { translateY, opacity, scrollHandler } = useHideOnScrollDownAnimation(height, {
    direction: 'upward',
  });

  useEffect(() => {
    store.setState({ scrollHandler, translateProgress: translateY, opacityProgress: opacity });
  }, [store, scrollHandler, translateY, opacity]);

  return <HeaderContext.Provider value={store}>{children}</HeaderContext.Provider>;
}

// #region hooks/helpers

function useHeaderStore<T>(selector: (state: HeaderStore) => T) {
  const store = useContext(HeaderContext);
  if (!store) {
    throw new Error('useDrawerHeaderStore must be used within a DrawerHeaderProvider');
  }
  return useStore(store, selector);
}
// #endregion hooks/helpers
