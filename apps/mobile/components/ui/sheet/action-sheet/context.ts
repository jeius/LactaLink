import { createContext, useContext } from 'react';
import { useStore } from 'zustand/react';
import { createStore, StoreApi } from 'zustand/vanilla';
import { InitStore, SheetStore } from './types';

export const SheetStoreContext = createContext<StoreApi<SheetStore> | null>(null);

export function initSheetStore({ actions, ...init }: InitStore) {
  return createStore<SheetStore>((set, get) => ({
    ...init,
    mounted: init?.mounted ?? false,
    sheetRef: init.sheetRef ?? null,
    presented: init.presented ?? false,
    actions: {
      open: () => {
        const { sheetRef, mounted, presented } = get();

        // Prevent opening if not mounted or already presented
        if (!mounted || presented) return;

        sheetRef?.current?.present();
      },
      close: () => {
        const { sheetRef, mounted, presented } = get();

        // Prevent closing if not mounted or already closed
        if (!mounted || !presented) return;

        sheetRef?.current?.dismiss();
      },
      handleOnOpen: () => {
        set({ presented: true });
        actions?.handleOnOpen?.(); // Notify external handler
      },
      handleOnClose: () => {
        set({ presented: false });
        actions?.handleOnClose?.(); // Notify external handler
      },
    },
  }));
}

function useSelector<T>(selector: (state: SheetStore) => T) {
  const store = useContext(SheetStoreContext);
  if (!store) {
    throw new Error('useSheetStore must be used within a Sheet');
  }
  return useStore(store, selector);
}

export function useSheetStore() {
  const store = useContext(SheetStoreContext);
  if (!store) {
    throw new Error('useSheetStore must be used within a Sheet');
  }
  return store;
}

export const useSheetRef = () => useSelector((state) => state.sheetRef);

export const useSheetActions = () => useSelector((state) => state.actions);

export const usePresentedSheet = () => useSelector((state) => state.presented);
