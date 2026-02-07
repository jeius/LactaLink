import { AnimatedPressable } from '@/components/animated/pressable';
import { getColor, getPrimaryColor } from '@/lib/colors';
import {
  BackPressEvent,
  DetentChangeEvent,
  DidDismissEvent,
  DidPresentEvent,
  TrueSheet,
} from '@lodev09/react-native-true-sheet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import {
  SheetStoreContext,
  initSheetStore,
  useBottomSheetState,
  useSheetRef,
  useSheetStoreActions,
} from './context';
import { sheetContentStyle, sheetTriggerStyle } from './styles';
import { SheetContentProps, SheetPortalProps, SheetProps, SheetTriggerProps } from './types';

type BottomSheetProps = SheetProps;
type BottomSheetPortalProps = SheetPortalProps;
type BottomSheetContentProps = SheetContentProps;
type BottomSheetTriggerProps = SheetTriggerProps;

function BottomSheetProvider({
  onOpen,
  onClose,
  sheetRef,
  open,
  setOpen,
  children,
  defaultOpen = false,
  collapsible = false,
}: BottomSheetProps) {
  const localRef = useRef<TrueSheet>(null);
  const ref = sheetRef ?? localRef;

  const handleOpen = useCallback(() => {
    onOpen?.();
    setOpen?.(true);
  }, [onOpen, setOpen]);

  const handleClose = useCallback(() => {
    onClose?.();
    setOpen?.(false);
  }, [onClose, setOpen]);

  const [store] = useState(() =>
    initSheetStore({
      presented: open ?? defaultOpen ?? false,
      collapsible,
      actions: {
        handleOpen,
        handleClose,
        setPresented: setOpen,
      },
    })
  );

  useEffect(() => {
    store.setState({ sheetRef: ref });
  }, [ref, store]);

  useEffect(() => {
    if (open !== undefined) {
      const { handleOpen, handleClose } = store.getState().actions;
      if (open) handleOpen();
      else handleClose();
    }
  }, [open, store]);

  return <SheetStoreContext.Provider value={store}>{children}</SheetStoreContext.Provider>;
}

function BottomSheetPortal({
  onDidPresent,
  onDidDismiss,
  onBackPress,
  initialDetentIndex,
  onDetentChange,
  detents,
  grabberOptions = {},
  children,
  ...props
}: BottomSheetPortalProps) {
  const { setPresented, handleClose, setInitialDetentIndex } = useSheetStoreActions();
  const { presented, collapsible } = useBottomSheetState();
  const sheetRef = useSheetRef();

  const handlePresent = useCallback(
    (e: DidPresentEvent) => {
      setPresented(true);
      onDidPresent?.(e);
    },
    [onDidPresent, setPresented]
  );

  const handleDismiss = useCallback(
    (e: DidDismissEvent) => {
      setPresented(false);
      onDidDismiss?.(e);
    },
    [onDidDismiss, setPresented]
  );

  const handleBackPress = useCallback(
    (e: BackPressEvent) => {
      onBackPress?.(e);
      if (!e.defaultPrevented && presented) handleClose();
    },
    [handleClose, onBackPress, presented]
  );

  const handleSheetChanges = useCallback(
    (e: DetentChangeEvent) => {
      const { index } = e.nativeEvent;

      onDetentChange?.(e);

      if (index === -1 || (index === 0 && !collapsible)) {
        handleClose();
      } else if (index >= 0 || (index === 0 && collapsible)) {
        setPresented(true);
      }
    },
    [onDetentChange, collapsible, handleClose, setPresented]
  );

  useEffect(() => {
    setInitialDetentIndex?.(initialDetentIndex);
  }, [initialDetentIndex, setInitialDetentIndex]);

  return (
    <TrueSheet
      {...props}
      ref={sheetRef}
      detents={detents}
      initialDetentIndex={initialDetentIndex}
      onDidPresent={handlePresent}
      onDidDismiss={handleDismiss}
      onBackPress={handleBackPress}
      onDetentChange={handleSheetChanges}
      grabberOptions={{ color: getPrimaryColor('500'), adaptive: false, ...grabberOptions }}
      backgroundColor={props.backgroundColor ?? getColor('background', '50')}
    >
      <View className="h-8" />
      {children}
    </TrueSheet>
  );
}

function BottomSheetContent({ className, ...props }: BottomSheetContentProps) {
  return <View {...props} className={sheetContentStyle({ className })} />;
}

function BottomSheetTrigger({ className, onPress, ...props }: BottomSheetTriggerProps) {
  const { handleOpen } = useSheetStoreActions();
  return (
    <AnimatedPressable
      {...props}
      className={sheetTriggerStyle({ className })}
      onPress={(e) => {
        onPress?.(e);
        handleOpen();
      }}
    >
      {props.children}
    </AnimatedPressable>
  );
}

export const BottomSheet = Object.assign(BottomSheetProvider, {
  Portal: BottomSheetPortal,
  Content: BottomSheetContent,
  Trigger: BottomSheetTrigger,
});

export default BottomSheet;
