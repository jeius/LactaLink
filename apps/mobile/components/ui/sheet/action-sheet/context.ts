import { createContext, useContext } from 'react';
import { useStore } from 'zustand/react';
import { createStore, StoreApi } from 'zustand/vanilla';
import { InitStore, SheetStore } from './types';

export const SheetStoreContext = createContext<StoreApi<SheetStore> | null>(null);

export function initSheetStore({ actions, ...init }: InitStore) {
  return createStore<SheetStore>((set, get) => ({
    ...init,
    sheetRef: init.sheetRef ?? null,
    presented: init.presented ?? false,
    actions: {
      handleOpen: () => {
        const { sheetRef } = get();
        sheetRef?.current?.present();
        set({ presented: true });
        actions?.handleOpen?.(); // Notify external handler
      },
      handleClose: () => {
        const { sheetRef } = get();
        sheetRef?.current?.dismiss();
        set({ presented: false });
        actions?.handleClose?.(); // Notify external handler
      },
      setPresented: (presented) => {
        set({ presented });
        // Notify external setVisible (parent component)
        actions?.setPresented?.(presented);
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
