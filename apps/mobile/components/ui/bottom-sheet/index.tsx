import { AnimatedPressable } from '@/components/animated/pressable';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { getColor, getPrimaryColor } from '@/lib/colors';
import { createDirectionalShadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import GorhomBottomSheet, {
  BottomSheetHandle,
  BottomSheetBackdrop as GorhomBottomSheetBackdrop,
  BottomSheetFlatList as GorhomBottomSheetFlatList,
  BottomSheetTextInput as GorhomBottomSheetInput,
  BottomSheetModal as GorhomBottomSheetModal,
  BottomSheetModalProvider as GorhomBottomSheetModalProvider,
  BottomSheetScrollView as GorhomBottomSheetScrollView,
  BottomSheetSectionList as GorhomBottomSheetSectionList,
  BottomSheetView as GorhomBottomSheetView,
  SNAP_POINT_TYPE,
  useBottomSheetScrollableCreator,
} from '@gorhom/bottom-sheet';
import { FocusScope } from '@react-native-aria/focus';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { cssInterop } from 'nativewind';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlatListProps, PressableProps, TextProps, ViewProps } from 'react-native';
import { Platform } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from '../pressable';
import { Text } from '../text';
import {
  BottomSheetStoreContext,
  createBottomSheetStore,
  useBottomSheetActions,
  useBottomSheetModalRef,
  useBottomSheetRef,
  useBottomSheetState,
  useBottomSheetStore,
  useBottomSheetVisibility,
} from './context';
import { BottomSheetModalPortalProps, BottomSheetPortalProps, BottomSheetProps } from './types';

const bottomSheetBackdropStyle = tva({
  base: 'absolute inset-0 flex-1 touch-none select-none bg-background-600 opacity-0',
});

const bottomSheetContentStyle = tva({
  base: '',
});

const bottomSheetTriggerStyle = tva({
  base: '',
});

const bottomSheetIndicatorStyle = tva({
  base: 'w-full items-center bg-background-0 pb-4 pt-2',
});

const bottomSheetItemStyle = tva({
  base: 'disabled:opacity-0.4 w-full flex-row items-center rounded-sm p-3 hover:bg-background-50 focus:bg-background-100 active:bg-background-100 disabled:cursor-not-allowed web:pointer-events-auto web:focus-visible:bg-background-100',
});

export const BottomSheet = ({
  snapToIndex,
  onOpen,
  onClose,
  open,
  setOpen,
  defaultOpen,
  sheetRef,
  sheetModalRef,
  disableClose = false,
  children,
}: BottomSheetProps) => {
  const localRef = useRef<GorhomBottomSheet>(null);
  const localModalRef = useRef<GorhomBottomSheetModal>(null);

  const ref = useMemo(() => sheetRef ?? localRef, [sheetRef]);
  const modalRef = useMemo(() => sheetModalRef ?? localModalRef, [sheetModalRef]);

  const position = useSharedValue(0);
  const currentIndex = useSharedValue(0);

  const handleOpen = useCallback(() => {
    onOpen?.();
    setOpen?.(true);
  }, [onOpen, setOpen]);

  const handleClose = useCallback(() => {
    onClose?.();
    setOpen?.(false);
  }, [onClose, setOpen]);

  const [store] = useState(() =>
    createBottomSheetStore({
      snapToIndex: snapToIndex,
      position: position,
      currentIndex: currentIndex,
      disableClose: disableClose,
      visible: open ?? defaultOpen,
      actions: { handleClose, handleOpen, setVisible: setOpen },
    })
  );

  useEffect(() => {
    if (open !== undefined) {
      const { handleOpen, handleClose } = store.getState().actions;
      if (open) handleOpen();
      else handleClose();
    }
  }, [open, store]);

  useEffect(() => {
    const { setDisableClose } = store.getState().actions;
    setDisableClose(disableClose);
  }, [disableClose, store]);

  useEffect(() => {
    if (snapToIndex !== undefined) {
      const { setSnapToIndex } = store.getState().actions;
      setSnapToIndex(snapToIndex);
    }
  }, [snapToIndex, store]);

  useEffect(() => {
    store.setState({ bottomSheetRef: ref, bottomSheetModalRef: modalRef });
  }, [ref, modalRef, store]);

  return (
    <BottomSheetStoreContext.Provider value={store}>{children}</BottomSheetStoreContext.Provider>
  );
};

export const BottomSheetPortal = ({
  snapPoints,
  handleComponent: DragIndicator,
  backdropComponent: BackDrop,
  onChange,
  animatedIndex: parentAnimatedIdx,
  animatedPosition: parentAnimatedPos,
  disableCollapseOnBackPress = false,
  ...props
}: BottomSheetPortalProps) => {
  const bottomSheetRef = useBottomSheetRef();
  const state = useBottomSheetState();
  const { handleClose, setVisible, setPosition, setCurrentIndex } = useBottomSheetActions();

  const handleSheetChanges = useCallback(
    (index: number, pos: number, type: SNAP_POINT_TYPE) => {
      if (index === -1 || (index === 0 && state.disableClose)) {
        handleClose();
      } else if (index >= 0 || (index === 0 && !state.disableClose)) {
        setVisible(true);
      }
      onChange?.(index, pos, type);
    },
    [state.disableClose, onChange, handleClose, setVisible]
  );

  usePreventBackPress(!disableCollapseOnBackPress && state.visible, handleClose);

  useEffect(() => {
    if (parentAnimatedPos) setPosition(parentAnimatedPos);
  }, [parentAnimatedPos, setPosition]);

  useEffect(() => {
    if (parentAnimatedIdx) setCurrentIndex(parentAnimatedIdx);
  }, [parentAnimatedIdx, setCurrentIndex]);

  return (
    <GorhomBottomSheet
      {...props}
      ref={bottomSheetRef ?? undefined}
      snapPoints={snapPoints}
      index={state.snapToIndex}
      backdropComponent={BackDrop}
      onChange={handleSheetChanges}
      handleComponent={DragIndicator}
      handleIndicatorStyle={{ backgroundColor: getPrimaryColor('500'), width: 40 }}
      backgroundStyle={[{ backgroundColor: getColor('background', '0') }, props.backgroundStyle]}
      enablePanDownToClose={props.enablePanDownToClose ?? !state.disableClose}
      animatedPosition={state.position}
      animatedIndex={state.currentIndex}
    >
      {props.children}
    </GorhomBottomSheet>
  );
};

export const BottomSheetModalPortal = ({
  snapPoints,
  handleComponent: DragIndicator,
  backdropComponent: BackDrop,
  onChange,
  animatedIndex: parentAnimatedIdx,
  animatedPosition: parentAnimatedPos,
  disableCollapseOnBackPress = false,
  children,
  ...props
}: BottomSheetModalPortalProps) => {
  const bottomSheetRef = useBottomSheetModalRef();
  const state = useBottomSheetState();
  const { handleClose, setVisible, setPosition, setCurrentIndex } = useBottomSheetActions();

  const store = useBottomSheetStore();

  const handleSheetChanges = useCallback(
    (index: number, pos: number, type: SNAP_POINT_TYPE) => {
      if (index === -1 || (index === 0 && state.disableClose)) {
        handleClose();
      } else if (index >= 0 || (index === 0 && !state.disableClose)) {
        setVisible(true);
      }
      onChange?.(index, pos, type);
    },
    [state.disableClose, onChange, handleClose, setVisible]
  );

  usePreventBackPress(!disableCollapseOnBackPress && state.visible, handleClose);

  useEffect(() => {
    if (parentAnimatedPos) setPosition(parentAnimatedPos);
  }, [parentAnimatedPos, setPosition]);

  useEffect(() => {
    if (parentAnimatedIdx) setCurrentIndex(parentAnimatedIdx);
  }, [parentAnimatedIdx, setCurrentIndex]);

  return (
    <GorhomBottomSheetModal
      {...props}
      ref={bottomSheetRef ?? undefined}
      snapPoints={snapPoints}
      index={state.snapToIndex}
      backdropComponent={BackDrop}
      onChange={handleSheetChanges}
      handleComponent={DragIndicator}
      handleIndicatorStyle={{ backgroundColor: getPrimaryColor('500'), width: 40 }}
      backgroundStyle={[{ backgroundColor: getColor('background', '0') }, props.backgroundStyle]}
      enablePanDownToClose={props.enablePanDownToClose ?? !state.disableClose}
      animatedPosition={state.position}
      animatedIndex={state.currentIndex}
    >
      <BottomSheetStoreContext.Provider value={store}>{children}</BottomSheetStoreContext.Provider>
    </GorhomBottomSheetModal>
  );
};

export const BottomSheetTrigger = ({
  className,
  ...props
}: PressableProps & { className?: string; disableAnimation?: boolean }) => {
  const { handleOpen } = useBottomSheetActions();
  return (
    <AnimatedPressable
      {...props}
      onPress={(e) => {
        props.onPress && props.onPress(e);
        handleOpen();
      }}
      disablePressAnimation={props.disableAnimation}
      className={bottomSheetTriggerStyle({
        className: className,
      })}
    >
      {props.children}
    </AnimatedPressable>
  );
};
type IBottomSheetBackdrop = React.ComponentProps<typeof GorhomBottomSheetBackdrop>;

export const BottomSheetBackdrop = ({
  disappearsOnIndex = -1,
  appearsOnIndex = 0,
  className,
  ...props
}: Partial<IBottomSheetBackdrop> & { className?: ViewProps['className'] }) => {
  const { bottom } = useSafeAreaInsets();
  return (
    <GorhomBottomSheetBackdrop
      {...props}
      disappearsOnIndex={disappearsOnIndex}
      appearsOnIndex={appearsOnIndex}
      style={[{ marginBottom: bottom }, props.style]}
      // @ts-expect-error gluestack-issue
      className={bottomSheetBackdropStyle({
        className: className,
      })}
    />
  );
};

cssInterop(GorhomBottomSheetBackdrop, { className: 'style' });

type IBottomSheetDragIndicator = React.ComponentProps<typeof BottomSheetHandle>;

export const BottomSheetDragIndicator = ({
  children,
  className,
  ...props
}: Partial<IBottomSheetDragIndicator> & { className?: ViewProps['className'] }) => {
  return (
    <BottomSheetHandle
      {...props}
      // @ts-expect-error gluestack-issue
      className={bottomSheetIndicatorStyle({
        className: className,
      })}
      style={[
        { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
        createDirectionalShadow('top', 'md'),
        props.style,
      ]}
    >
      {children}
    </BottomSheetHandle>
  );
};

cssInterop(BottomSheetHandle, { className: 'style' });

type IBottomSheetContent = React.ComponentProps<typeof GorhomBottomSheetView>;

export const BottomSheetContent = ({ ...props }: IBottomSheetContent) => {
  const { handleClose } = useBottomSheetActions();
  const visible = useBottomSheetVisibility();

  const keyDownHandlers = useMemo(() => {
    return Platform.OS === 'web'
      ? {
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              handleClose();
              return;
            }
          },
        }
      : {};
  }, [handleClose]);

  if (Platform.OS === 'web')
    return (
      <GorhomBottomSheetView
        {...props}
        {...keyDownHandlers}
        className={bottomSheetContentStyle({
          className: props.className,
        })}
      >
        {visible && (
          <FocusScope contain={visible} autoFocus={true} restoreFocus={true}>
            {props.children}
          </FocusScope>
        )}
      </GorhomBottomSheetView>
    );

  return (
    <GorhomBottomSheetView
      {...props}
      {...keyDownHandlers}
      className={bottomSheetContentStyle({
        className: props.className,
      })}
    >
      {props.children}
    </GorhomBottomSheetView>
  );
};

cssInterop(GorhomBottomSheetView, { className: 'style' });

export const BottomSheetItem = ({
  children,
  className,
  closeOnSelect = true,
  ...props
}: PressableProps & {
  closeOnSelect?: boolean;
}) => {
  const { handleClose } = useBottomSheetActions();
  return (
    <Pressable
      {...props}
      role="button"
      className={bottomSheetItemStyle({ className: className })}
      onPress={(e) => {
        if (closeOnSelect) handleClose();
        props.onPress?.(e);
      }}
    >
      {children}
    </Pressable>
  );
};

export const BottomSheetItemText = ({ ...props }: TextProps) => {
  return <Text {...props} />;
};

type IBottomSheetFlashListProps<TItem> = Omit<FlashListProps<TItem>, 'renderScrollComponent'>;

export function BottomSheetFlashList<TItem>({
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  ...props
}: IBottomSheetFlashListProps<TItem>) {
  const BottomSheetScrollable = useBottomSheetScrollableCreator({ focusHook: useFocusEffect });
  return (
    <FlashList
      {...props}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      renderScrollComponent={BottomSheetScrollable}
    />
  );
}

type IBottomSheetFlatListProps<TItem> = Omit<FlatListProps<TItem>, 'renderScrollComponent'>;

export function BottomSheetFlatList<TItem>({
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  ...props
}: IBottomSheetFlatListProps<TItem>) {
  return (
    <GorhomBottomSheetFlatList
      {...props}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
    />
  );
}

type IBottomSheetScrollViewProps = React.ComponentProps<typeof GorhomBottomSheetScrollView>;

export function BottomSheetScrollView({
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  ...props
}: IBottomSheetScrollViewProps) {
  return (
    <GorhomBottomSheetScrollView
      {...props}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      focusHook={useFocusEffect}
    />
  );
}

export const BottomSheetSectionList = GorhomBottomSheetSectionList;
export const BottomSheetModalProvider = GorhomBottomSheetModalProvider;

cssInterop(GorhomBottomSheetInput, { className: 'style' });
cssInterop(GorhomBottomSheetScrollView, { className: 'style' });
cssInterop(GorhomBottomSheetFlatList, { className: 'style' });
cssInterop(GorhomBottomSheetSectionList, { className: 'style' });
cssInterop(GorhomBottomSheetModal, { className: 'style' });
cssInterop(BottomSheetFlashList, { className: 'style' });
