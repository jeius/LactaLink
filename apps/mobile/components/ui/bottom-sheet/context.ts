import { TimingConfig } from '@gorhom/bottom-sheet/lib/typescript/types';
import { createContext, useContext } from 'react';
import { Easing } from 'react-native-reanimated';
import { useStore } from 'zustand/react';
import { useShallow } from 'zustand/shallow';
import { createStore, StoreApi } from 'zustand/vanilla';
import { BottomSheetState, BottomSheetStore, CreateBottomSheetStore } from './types';

export const BottomSheetStoreContext = createContext<StoreApi<BottomSheetStore> | null>(null);

export function createBottomSheetStore({ actions, ...init }: CreateBottomSheetStore) {
  const timingConfig: TimingConfig = { duration: 300, easing: Easing.inOut(Easing.ease) };

  return createStore<BottomSheetStore>((set, get) => ({
    ...init,
    bottomSheetRef: init.bottomSheetRef ?? null,
    bottomSheetModalRef: init.bottomSheetModalRef ?? null,
    visible: init.visible ?? false,
    snapToIndex: init.snapToIndex ?? 0,
    disableClose: init.disableClose ?? false,
    actions: {
      setSnapToIndex: (snapToIndex) => set({ snapToIndex }),
      setPosition: (position) => set({ position }),
      setCurrentIndex: (currentIndex) => set({ currentIndex }),
      setDisableClose: (disableClose) => set({ disableClose }),
      handleOpen: () => {
        const { bottomSheetRef, snapToIndex, bottomSheetModalRef } = get();

        if (snapToIndex === undefined) {
          bottomSheetRef?.current?.expand(timingConfig);
        } else {
          bottomSheetRef?.current?.snapToIndex(Math.max(0, snapToIndex), timingConfig);
        }
        bottomSheetModalRef?.current?.present();

        set({ visible: true });
        actions?.handleOpen?.(); // Notify external handler
      },
      handleClose: () => {
        const { bottomSheetRef, disableClose, bottomSheetModalRef } = get();

        if (disableClose) {
          bottomSheetRef?.current?.collapse(timingConfig);
          bottomSheetModalRef?.current?.collapse(timingConfig);
        } else {
          bottomSheetRef?.current?.close(timingConfig);
          bottomSheetModalRef?.current?.dismiss(timingConfig);
        }

        set({ visible: false });
        actions?.handleClose?.(); // Notify external handler
      },
      setVisible: (visible: boolean) => {
        set({ visible });
        // Notify external setVisible (parent component)
        actions?.setVisible?.(visible);
      },
    },
  }));
}

function useSelector<T>(selector: (state: BottomSheetStore) => T) {
  const store = useContext(BottomSheetStoreContext);
  if (!store) {
    throw new Error('useBottomSheetStore must be used within a BottomSheet');
  }
  return useStore(store, selector);
}

export function useBottomSheetStore() {
  const store = useContext(BottomSheetStoreContext);
  if (!store) {
    throw new Error('useBottomSheetStore must be used within a BottomSheet');
  }
  return store;
}

export const useBottomSheetRef = () => useSelector((state) => state.bottomSheetRef);

export const useBottomSheetModalRef = () => useSelector((state) => state.bottomSheetModalRef);

export const useBottomSheetActions = () => useSelector((state) => state.actions);

export const useBottomSheetVisibility = () => useSelector((state) => state.visible);

export function useBottomSheetShallow<T = BottomSheetStore>(
  selector?: (state: BottomSheetStore) => T
) {
  const store = useContext(BottomSheetStoreContext);
  if (!store) {
    throw new Error('useBottomSheet must be used within a BottomSheet');
  }
  return useStore(store, useShallow(selector ?? ((state) => state as T)));
}

export function useBottomSheetState<T = BottomSheetState>(
  selector?: (state: BottomSheetState) => T
) {
  return useBottomSheetShallow(
    selector ??
      ((s) =>
        ({
          currentIndex: s.currentIndex,
          position: s.position,
          snapToIndex: s.snapToIndex,
          visible: s.visible,
          disableClose: s.disableClose,
        }) as BottomSheetState as T)
  );
}
