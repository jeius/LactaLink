import { getColor, getPrimaryColor } from '@/lib/colors';
import { DidDismissEvent, DidPresentEvent, TrueSheet } from '@lodev09/react-native-true-sheet';
import { cssInterop } from 'nativewind';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';
import { Pressable } from '../../pressable';
import {
  SheetStoreContext,
  initSheetStore,
  usePresentedSheet,
  useSheetActions,
  useSheetRef,
} from './context';
import { sheetContentStyle, sheetIconStyle, sheetItemStyle, sheetTriggerStyle } from './styles';
import type {
  ActionSheetContentProps,
  ActionSheetIconProps,
  ActionSheetItemProps,
  ActionSheetListProps,
  ActionSheetProps,
  ActionSheetTextProps,
  ActionSheetTriggerProps,
} from './types';

import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../icon';
import { VerticalInfiniteList } from '../../list';
import { Text } from '../../text';

function ActionSheetProvider({
  onOpen,
  onClose,
  open,
  setOpen,
  children,
  sheetRef,
}: ActionSheetProps) {
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
      presented: open ?? false,
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

function ActionSheetContent({
  onDidPresent,
  onDidDismiss,
  dimmed = true,
  detents = ['auto'],
  dismissible = true,
  grabberOptions = {},
  cornerRadius = 24,
  insetAdjustment = 'never',
  ...props
}: ActionSheetContentProps) {
  const insets = useSafeAreaInsets();
  const { setPresented, handleClose } = useSheetActions();
  const presented = usePresentedSheet();
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

  usePreventBackPress(presented, handleClose);

  return (
    <TrueSheet
      {...props}
      ref={sheetRef}
      detents={detents}
      dimmed={dimmed}
      dismissible={dismissible}
      cornerRadius={cornerRadius}
      onDidPresent={handlePresent}
      onDidDismiss={handleDismiss}
      grabberOptions={{ color: getPrimaryColor('500'), adaptive: false, ...grabberOptions }}
      backgroundColor={props.backgroundColor ?? getColor('background', '0')}
      className={sheetContentStyle({ className: props.className })}
      insetAdjustment={insetAdjustment}
      style={StyleSheet.flatten([{ paddingBottom: insets.bottom }, props.style])}
      header={props.header ?? <View />}
      headerStyle={StyleSheet.flatten([{ marginTop: 30 }, props.headerStyle])}
    />
  );
}

const ActionSheetItem = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  ActionSheetItemProps
>(function ActionSheetItem({ className, onPress, ...props }, ref) {
  const { handleClose } = useSheetActions();

  const handlePress = useCallback(
    (options: GestureResponderEvent) => {
      onPress?.(options);
      handleClose();
    },
    [onPress, handleClose]
  );

  return (
    <Pressable
      {...props}
      ref={ref}
      onPress={handlePress}
      className={sheetItemStyle({ className })}
    />
  );
});

function ActionSheetTrigger({ onPress, className, ...props }: ActionSheetTriggerProps) {
  const { handleOpen } = useSheetActions();

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      onPress?.(e);
      handleOpen();
    },
    [onPress, handleOpen]
  );

  return (
    <Pressable {...props} onPress={handlePress} className={sheetTriggerStyle({ className })} />
  );
}

function ActionSheetItemText({ className, ...props }: ActionSheetTextProps) {
  return <Text {...props} />;
}

function ActionSheetList<T>({ ...props }: ActionSheetListProps<T>) {
  return <VerticalInfiniteList {...props} />;
}

function ActionSheetIcon({ className, ...props }: ActionSheetIconProps) {
  return <Icon {...props} className={sheetIconStyle({ className })} />;
}

ActionSheetProvider.displayName = 'ActionSheet';
ActionSheetItem.displayName = 'ActionSheetItem';
ActionSheetList.displayName = 'ActionSheetList';
ActionSheetItemText.displayName = 'ActionSheetItemText';
ActionSheetIcon.displayName = 'ActionSheetIcon';
ActionSheetContent.displayName = 'ActionSheetContent';
ActionSheetTrigger.displayName = 'ActionSheetTrigger';

const ActionSheet = Object.assign(ActionSheetProvider, {
  Content: ActionSheetContent,
  Item: ActionSheetItem,
  List: ActionSheetList,
  ItemText: ActionSheetItemText,
  Icon: ActionSheetIcon,
  Trigger: ActionSheetTrigger,
});

cssInterop(ActionSheetContent, { className: 'style' });

export { ActionSheet };
export type {
  ActionSheetContentProps,
  ActionSheetIconProps,
  ActionSheetItemProps,
  ActionSheetListProps,
  ActionSheetProps,
  ActionSheetTextProps,
  ActionSheetTriggerProps,
};
export default ActionSheet;
