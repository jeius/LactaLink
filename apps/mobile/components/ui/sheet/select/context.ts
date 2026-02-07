import { createContext, useContext } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { SelectStore } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectStoreContext = createContext<StoreApi<SelectStore<any>> | null>(null);

function useSelectStore<T, V = unknown>(selector: (state: SelectStore<T>) => V) {
  const store = useContext(SelectStoreContext);
  if (!store) {
    throw new Error('useSelectActionSheetStore must be used within a SelectActionSheet');
  }
  return useStore(store, selector);
}

function useSelectedValue<T = unknown>() {
  return useSelectStore<T>((state) => state.selected);
}

function initStore<T>(params: Partial<SelectStore<T>> = {}) {
  return createStore<SelectStore<T>>((set) => ({
    selected: params.selected ?? null,
    setSelected: (value) => {
      set({ selected: value });
      params.setSelected?.(value);
    },
  }));
}

export {
  initStore,
  SelectStoreContext,
  useSelectStore as useSelectActionSheetStore,
  useSelectedValue,
};
