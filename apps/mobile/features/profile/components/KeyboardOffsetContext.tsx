import { PropsWithChildren, useEffect } from 'react';
import { LayoutRectangle } from 'react-native';
import { create } from 'zustand';

const useKeyboardOffsetStore = create<LayoutRectangle>(() => ({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
}));

export { useKeyboardOffsetStore as useKeyboardOffset };

export default function KeyboardOffsetProvider({
  children,
  ...props
}: PropsWithChildren<LayoutRectangle>) {
  useEffect(() => {
    useKeyboardOffsetStore.setState(props);
  }, [props]);

  return children;
}
