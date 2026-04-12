import isEqual from 'lodash/isEqual';
import { createContext, useContext } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { SelectProps, SelectStore } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectStoreContext = createContext<StoreApi<SelectStore<any>> | null>(null);

export const SelectItemContext = createContext<{ value: unknown } | null>(null);

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

function initStore<T, TMultiSelect extends boolean = false>(
  params: Partial<SelectProps<T, TMultiSelect>> = {}
) {
  return createStore<SelectStore<T>>((set, get) => ({
    selected: params.selected ?? null,
    isMultiSelect: params.isMultiSelect ?? false,
    onSelect: (value) => params.onSelect?.(value as (TMultiSelect extends true ? T[] : T) | null),
    setSelected: (value) => {
      const { isMultiSelect, selected, onSelect } = get();

      if (!isMultiSelect) {
        if (isEqual(value, selected)) {
          set({ selected: null });
          onSelect?.(null as (TMultiSelect extends true ? T[] : T) | null);
        } else {
          set({ selected: value });
          onSelect?.(value as (TMultiSelect extends true ? T[] : T) | null);
        }
        return;
      }

      const selectedArray = Array.isArray(selected) ? selected : selected ? [selected] : [];
      const valueIndex = selectedArray.findIndex((item) => isEqual(item, value));
      let newSelected: T[];

      if (valueIndex > -1) {
        newSelected = [
          ...selectedArray.slice(0, valueIndex),
          ...selectedArray.slice(valueIndex + 1),
        ];
      } else {
        newSelected = [...selectedArray, value];
      }

      set({ selected: newSelected });
      onSelect?.(newSelected as (TMultiSelect extends true ? T[] : T) | null);
      return;
    },
  }));
}

export {
  initStore,
  SelectStoreContext,
  useSelectStore as useSelectActionSheetStore,
  useSelectedValue,
};
