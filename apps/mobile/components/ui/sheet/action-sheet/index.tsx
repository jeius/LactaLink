import { DidDismissEvent, DidPresentEvent, TrueSheet } from '@lodev09/react-native-true-sheet';
import React, {
  ComponentRef,
  FC,
  ForwardedRef,
  forwardRef,
  JSX,
  PropsWithoutRef,
  RefAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { GestureResponderEvent } from 'react-native';
import { Pressable } from '../../pressable';
import { initSheetStore, SheetStoreContext, useSheetActions, useSheetRef } from './context';
import { sheetContentStyle, sheetIconStyle, sheetItemStyle, sheetTriggerStyle } from './styles';
import type {
  ActionSheetContentProps,
  ActionSheetFlashListProps,
  ActionSheetIconProps,
  ActionSheetItemProps,
  ActionSheetListProps,
  ActionSheetProps,
  ActionSheetTextProps,
  ActionSheetTriggerProps,
} from './types';

import { FlashList, FlashListRef } from '../../FlashList';
import { Icon } from '../../icon';
import { InfiniteFlashList, InfiniteFlashListRef, VerticalInfiniteList } from '../../list';
import Slot from '../../Slot';
import { Text } from '../../text';
import Sheet, { SheetRef } from '../Sheet';

const ActionSheetProvider = forwardRef<SheetRef, ActionSheetProps>(function ActionSheetProvider(
  { onOpen, onClose, open: openProp, setOpen: setOpenProp, children, sheetRef },
  externalRef
) {
  const localRef = useRef<TrueSheet>(null);
  const [localOpen, setLocalOpen] = useState(openProp ?? false);

  const ref = (typeof externalRef !== 'function' ? externalRef : sheetRef) ?? localRef;
  const open = openProp !== undefined ? openProp : localOpen;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setLocalOpen;

  const handleOnOpen = useCallback(() => {
    onOpen?.();
    setOpen?.(true);
  }, [onOpen, setOpen]);

  const handleOnClose = useCallback(() => {
    onClose?.();
    setOpen?.(false);
  }, [onClose, setOpen]);

  const [store] = useState(() =>
    initSheetStore({
      presented: open ?? false,
      actions: { handleOnOpen, handleOnClose },
    })
  );

  useEffect(() => {
    store.setState({ sheetRef: ref, mounted: true });
  }, [ref, store]);

  useEffect(() => {
    if (open === undefined) return;
    const { open: present, close } = store.getState().actions;
    if (open) present();
    else close();
  }, [open, store]);

  return <SheetStoreContext.Provider value={store}>{children}</SheetStoreContext.Provider>;
});

function ActionSheetContent({
  onDidPresent,
  onDidDismiss,
  detents = ['auto'],
  ...props
}: ActionSheetContentProps) {
  const { handleOnClose: handleClose, handleOnOpen: handleOpen } = useSheetActions();
  const sheetRef = useSheetRef();

  const handlePresent = useCallback(
    (e: DidPresentEvent) => {
      handleOpen();
      onDidPresent?.(e);
    },
    [onDidPresent, handleOpen]
  );

  const handleDismiss = useCallback(
    (e: DidDismissEvent) => {
      handleClose();
      onDidDismiss?.(e);
    },
    [onDidDismiss, handleClose]
  );

  return (
    <Sheet
      {...props}
      ref={sheetRef}
      detents={detents}
      onDidPresent={handlePresent}
      onDidDismiss={handleDismiss}
      className={sheetContentStyle({ className: props.className })}
    />
  );
}

const ActionSheetItem = React.forwardRef<ComponentRef<typeof Pressable>, ActionSheetItemProps>(
  function ActionSheetItem({ className, onPress, asChild, children, ...props }, ref) {
    const { close } = useSheetActions();

    const Comp = asChild ? Slot.Pressable : Pressable;

    const handlePress = useCallback(
      (e: GestureResponderEvent) => {
        e.persist();
        onPress?.(e);
        if (!e.defaultPrevented) close();
      },
      [onPress, close]
    );

    return (
      <Comp {...props} ref={ref} onPress={handlePress} className={sheetItemStyle({ className })}>
        {children}
      </Comp>
    );
  }
);

const ActionSheetTrigger = forwardRef<ComponentRef<typeof Pressable>, ActionSheetTriggerProps>(
  function ActionSheetTrigger({ onPress, className, asChild, children, ...props }, ref) {
    const { open } = useSheetActions();

    const Comp = asChild ? Slot.Pressable : Pressable;

    const handlePress = useCallback(
      (e: GestureResponderEvent) => {
        e.persist();
        onPress?.(e);
        if (!e.defaultPrevented) open();
      },
      [onPress, open]
    );

    return (
      <Comp {...props} ref={ref} onPress={handlePress} className={sheetTriggerStyle({ className })}>
        {children}
      </Comp>
    );
  }
);

function ActionSheetItemText({ ...props }: ActionSheetTextProps) {
  return <Text {...props} />;
}

/**
 * @deprecated Use `ActionSheetInfiniteList` instead for better performance
 */
function ActionSheetList<T>({ ...props }: ActionSheetListProps<T>) {
  return <VerticalInfiniteList {...props} />;
}

const ActionSheetInfiniteList = forwardRef(function ActionSheetInfiniteList<T>(
  { ...props }: ActionSheetListProps<T>,
  ref: ForwardedRef<InfiniteFlashListRef<T>>
) {
  return <InfiniteFlashList {...props} ref={ref} />;
}) as <T>(
  props: PropsWithoutRef<ActionSheetListProps<T>> & RefAttributes<InfiniteFlashListRef<T>>
) => JSX.Element;

const ActionSheetFlashList = forwardRef(function ActionSheetFlashList<T>(
  { ...props }: ActionSheetFlashListProps<T>,
  ref: ForwardedRef<FlashListRef<T>>
) {
  return <FlashList {...props} ref={ref} />;
}) as <T>(
  props: PropsWithoutRef<ActionSheetFlashListProps<T>> & RefAttributes<FlashListRef<T>>
) => JSX.Element;

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
(ActionSheetInfiniteList as FC).displayName = 'ActionSheetInfiniteList';
(ActionSheetFlashList as FC).displayName = 'ActionSheetFlashList';

const ActionSheet = Object.assign(ActionSheetProvider, {
  Content: ActionSheetContent,
  Item: ActionSheetItem,
  List: ActionSheetList,
  InfiniteList: ActionSheetInfiniteList,
  FlashList: ActionSheetFlashList,
  ItemText: ActionSheetItemText,
  Icon: ActionSheetIcon,
  Trigger: ActionSheetTrigger,
});

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
