import { createContext, useContext } from 'react';
import { useStore } from 'zustand/react';
import { useShallow } from 'zustand/shallow';
import { createStore, StoreApi } from 'zustand/vanilla';
import { CreateSheetStore, SheetState, SheetStore } from '../types';

export const SheetStoreContext = createContext<StoreApi<SheetStore> | null>(null);

export function initSheetStore({ actions, ...init }: CreateSheetStore) {
  return createStore<SheetStore>((set, get) => ({
    ...init,
    sheetRef: init.sheetRef ?? null,
    presented: init.presented ?? false,
    collapsible: init.collapsible ?? false,
    initialDetentIndex: init.initialDetentIndex ?? -1,
    actions: {
      handleOpen: () => {
        const { sheetRef, initialDetentIndex } = get();
        sheetRef?.current?.present(initialDetentIndex);
        set({ presented: true });
        actions?.handleOpen?.(); // Notify external handler
      },
      handleClose: () => {
        const { sheetRef, collapsible } = get();

        if (collapsible) sheetRef?.current?.resize(0);
        else sheetRef?.current?.dismiss();

        set({ presented: false });
        actions?.handleClose?.(); // Notify external handler
      },
      setPresented: (presented) => {
        set({ presented });
        // Notify external setVisible (parent component)
        actions?.setPresented?.(presented);
      },
      setCollapsible: (collapsible) => {
        set({ collapsible });
      },
      setInitialDetentIndex: (index) => {
        set({ initialDetentIndex: index });
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

export const useSheetStoreActions = () => useSelector((state) => state.actions);

export const usePresentedSheet = () => useSelector((state) => state.presented);

export function useSheet<T = SheetStore>(selector?: (state: SheetStore) => T) {
  const store = useContext(SheetStoreContext);
  if (!store) {
    throw new Error('useSheet must be used within a Sheet');
  }
  return useStore(store, useShallow(selector ?? ((state) => state as T)));
}

export function useBottomSheetState<T = SheetState>(selector?: (state: SheetState) => T) {
  return useSheet(
    selector ??
      ((s) =>
        ({
          presented: s.presented,
          collapsible: s.collapsible,
        }) as SheetState as T)
  );
}
