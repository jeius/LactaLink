import { useRecyclingState } from '@shopify/flash-list';
import React, { createContext, PropsWithChildren, useContext } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';

type InputFocusStateStore = {
  isFocused: boolean;
  actions: {
    setFocused: (focused: boolean) => void;
  };
};

interface InputFocusStateProviderProps extends PropsWithChildren {
  recyclingKey?: string;
}

const FocusStateContext = createContext<StoreApi<InputFocusStateStore> | null>(null);

export const useInputIsFocused = () => useFocusStateStore((s) => s.isFocused);
export const useInputFocusStateActions = () => useFocusStateStore((s) => s.actions);

export default function InputFocusStateProvider({
  children,
  recyclingKey,
}: InputFocusStateProviderProps) {
  const [store] = useRecyclingState(create, [recyclingKey]);
  return <FocusStateContext.Provider value={store}>{children}</FocusStateContext.Provider>;
}

function useFocusStateStore<T>(selector: (state: InputFocusStateStore) => T) {
  const store = useContext(FocusStateContext);
  if (!store) throw new Error('useFocusStateStore must be used within a FocusStateProvider');
  return useStore(store, selector);
}

function create() {
  return createStore<InputFocusStateStore>((set) => ({
    isFocused: false,
    actions: {
      setFocused: (focused: boolean) => set({ isFocused: focused }),
    },
  }));
}
