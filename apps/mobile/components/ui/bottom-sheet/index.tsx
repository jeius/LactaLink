import { AnimatedPressable } from '@/components/animated/pressable';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { usePreventBackPress } from '@/hooks/usePreventBackPress';
import { getHexColor } from '@/lib/colors';
import { VariantProps } from '@gluestack-ui/nativewind-utils';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import GorhomBottomSheet, {
  BottomSheetHandle,
  BottomSheetBackdrop as GorhomBottomSheetBackdrop,
  BottomSheetFlashList as GorhomBottomSheetFlashList,
  BottomSheetFlatList as GorhomBottomSheetFlatList,
  BottomSheetTextInput as GorhomBottomSheetInput,
  BottomSheetModal as GorhomBottomSheetModal,
  BottomSheetModalProvider as GorhomBottomSheetModalProvider,
  BottomSheetScrollView as GorhomBottomSheetScrollView,
  BottomSheetSectionList as GorhomBottomSheetSectionList,
  BottomSheetView as GorhomBottomSheetView,
  SNAP_POINT_TYPE,
} from '@gorhom/bottom-sheet';
import { FocusScope } from '@react-native-aria/focus';
import { useIsFocused } from '@react-navigation/native';
import { cssInterop } from 'nativewind';
import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PressableProps, TextProps } from 'react-native';
import { Platform, Pressable } from 'react-native';
import { Text } from '../text';

const bottomSheetBackdropStyle = tva({
  base: 'bg-background-100 absolute inset-0 flex-1 touch-none select-none opacity-0',
});

const bottomSheetContentStyle = tva({
  base: '',
});

const bottomSheetTriggerStyle = tva({
  base: '',
});

const bottomSheetIndicatorStyle = tva({
  base: 'bg-background-0 w-full items-center pb-4 pt-2',
});

const bottomSheetItemStyle = tva({
  base: 'disabled:opacity-0.4 web:pointer-events-auto hover:bg-background-50 active:bg-background-100 focus:bg-background-100 web:focus-visible:bg-background-100 w-full flex-row items-center rounded-sm p-3 disabled:cursor-not-allowed',
});

const bottomSheetTextInputStyle = tva({
  base: 'text-typography-900 placeholder:text-typography-500 ios:leading-[0px] web:cursor-text web:data-[disabled=true]:cursor-not-allowed h-full flex-1 px-3 py-0 font-sans',
  variants: {
    variant: {
      underlined: 'web:outline-0 web:outline-none px-0',
      outline: 'web:outline-0 web:outline-none',
      rounded: 'web:outline-0 web:outline-none px-4',
    },

    size: {
      '2xs': 'text-2xs',
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    },
  },
});

const BottomSheetContext = createContext<{
  visible: boolean;
  bottomSheetRef: React.RefObject<GorhomBottomSheet | null>;
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  handleClose: () => void;
  handleOpen: () => void;
  isFocused?: boolean;
}>({
  visible: false,
  bottomSheetRef: { current: null },
  bottomSheetModalRef: { current: null },
  handleClose: () => {},
  handleOpen: () => {},
});

type IBottomSheetProps = React.ComponentProps<typeof GorhomBottomSheet>;
type IBottomSheetModalProps = React.ComponentProps<typeof GorhomBottomSheetModal>;

interface BottomSheetProps {
  snapToIndex?: number;
  children?: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  sheetRef?: React.RefObject<GorhomBottomSheet | null>;
  sheetModalRef?: React.RefObject<GorhomBottomSheetModal | null>;
  disableClose?: boolean;
}

export const BottomSheet = ({
  snapToIndex = 0,
  onOpen,
  onClose,
  open,
  setOpen,
  defaultOpen = false,
  sheetRef,
  sheetModalRef,
  disableClose = false,
  children,
}: BottomSheetProps) => {
  const bottomSheetRef = useRef<GorhomBottomSheet>(null);
  const bottomSheetModalRef = useRef<GorhomBottomSheetModal>(null);
  const ref = sheetRef || bottomSheetRef;
  const modalRef = sheetModalRef || bottomSheetModalRef;

  const isFocused = useIsFocused();

  const [visible, setVisible] = useState(defaultOpen);

  const handleOpen = useCallback(() => {
    ref.current?.snapToIndex(snapToIndex);
    modalRef.current?.present();
    setVisible(true);
    setOpen?.(true);
    onOpen?.();
  }, [modalRef, onOpen, ref, setOpen, snapToIndex]);

  const handleClose = useCallback(() => {
    if (!disableClose) {
      ref.current?.close();
      modalRef.current?.dismiss();
    } else {
      ref.current?.collapse();
      modalRef.current?.collapse();
    }
    setVisible(false);
    setOpen?.(false);
    onClose?.();
  }, [disableClose, modalRef, onClose, ref, setOpen]);

  useEffect(() => {
    if (open !== undefined) {
      if (open) {
        handleOpen();
      } else {
        handleClose();
      }
    }
  }, [handleClose, handleOpen, open]);

  return (
    <BottomSheetContext.Provider
      value={{
        visible: open !== undefined ? open : visible,
        bottomSheetRef: ref,
        bottomSheetModalRef: modalRef,
        handleClose,
        handleOpen,
        isFocused,
      }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
};

export const BottomSheetPortal = ({
  snapPoints,
  handleComponent: DragIndicator,
  backdropComponent: BackDrop,
  snapToIndex = -1,
  enablePanDownToClose = true,
  ...props
}: Partial<IBottomSheetProps> & {
  defaultIsOpen?: boolean;
  snapToIndex?: number;
}) => {
  const { bottomSheetRef, handleClose, visible, isFocused } = useContext(BottomSheetContext);
  const { theme } = useTheme();
  const handleIndicatorColor = getHexColor(theme, 'primary', 500);
  const backgroundColor = getHexColor(theme, 'background', 50);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        handleClose();
      }
    },
    [handleClose]
  );

  usePreventBackPress(visible, handleClose);

  return (
    <GorhomBottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={snapToIndex}
      backdropComponent={BackDrop}
      onChange={handleSheetChanges}
      handleComponent={DragIndicator}
      handleIndicatorStyle={{ backgroundColor: handleIndicatorColor, width: 40 }}
      backgroundStyle={{ backgroundColor }}
      enablePanDownToClose={enablePanDownToClose}
      {...props}
    >
      {props.children}
    </GorhomBottomSheet>
  );
};

export const BottomSheetModalPortal = ({
  snapPoints,
  handleComponent: DragIndicator,
  backdropComponent: BackDrop,
  snapToIndex = 0,
  enablePanDownToClose = true,
  onChange,
  ref,
  ...props
}: Partial<IBottomSheetModalProps> & {
  snapToIndex?: number;
}) => {
  const { bottomSheetModalRef, handleClose, visible, isFocused } = useContext(BottomSheetContext);
  const { theme } = useTheme();
  const handleIndicatorColor = getHexColor(theme, 'primary', 500);
  const backgroundColor = getHexColor(theme, 'background', 50);

  const handleSheetChanges = useCallback(
    (index: number, position: number, type: SNAP_POINT_TYPE) => {
      onChange?.(index, position, type);
      if (index === -1) {
        handleClose();
      }
    },
    [handleClose, onChange]
  );

  usePreventBackPress(visible, handleClose);

  return (
    <GorhomBottomSheetModal
      ref={ref || bottomSheetModalRef}
      snapPoints={snapPoints}
      index={snapToIndex}
      backdropComponent={BackDrop}
      onChange={handleSheetChanges}
      handleComponent={DragIndicator}
      handleIndicatorStyle={{ backgroundColor: handleIndicatorColor, width: 40 }}
      backgroundStyle={{ backgroundColor }}
      enablePanDownToClose={enablePanDownToClose}
      {...props}
    >
      {props.children}
    </GorhomBottomSheetModal>
  );
};

export const BottomSheetTrigger = ({
  className,
  ...props
}: PressableProps & { className?: string; disableAnimation?: boolean }) => {
  const { handleOpen } = useContext(BottomSheetContext);
  return (
    <AnimatedPressable
      onPress={(e) => {
        props.onPress && props.onPress(e);
        handleOpen();
      }}
      {...props}
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
}: Partial<IBottomSheetBackdrop> & { className?: string }) => {
  return (
    <GorhomBottomSheetBackdrop
      // @ts-expect-error gluestack-issue
      className={bottomSheetBackdropStyle({
        className: className,
      })}
      disappearsOnIndex={disappearsOnIndex}
      appearsOnIndex={appearsOnIndex}
      {...props}
    />
  );
};

cssInterop(GorhomBottomSheetBackdrop, { className: 'style' });

type IBottomSheetDragIndicator = React.ComponentProps<typeof BottomSheetHandle>;

export const BottomSheetDragIndicator = ({
  children,
  className,
  ...props
}: Partial<IBottomSheetDragIndicator> & { className?: string }) => {
  return (
    <BottomSheetHandle
      {...props}
      // @ts-expect-error gluestack-issue
      className={bottomSheetIndicatorStyle({
        className: className,
      })}
      style={[{ borderTopLeftRadius: 18, borderTopRightRadius: 18 }, props.style]}
    >
      {children}
    </BottomSheetHandle>
  );
};

cssInterop(BottomSheetHandle, { className: 'style' });

type IBottomSheetContent = React.ComponentProps<typeof GorhomBottomSheetView>;

export const BottomSheetContent = ({ ...props }: IBottomSheetContent) => {
  const { handleClose, visible } = useContext(BottomSheetContext);
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
  const { handleClose } = useContext(BottomSheetContext);
  return (
    <Pressable
      {...props}
      className={bottomSheetItemStyle({
        className: className,
      })}
      onPress={(e) => {
        if (closeOnSelect) {
          handleClose();
        }
        props.onPress && props.onPress(e);
      }}
      role="button"
    >
      {children}
    </Pressable>
  );
};

export const BottomSheetItemText = ({ ...props }: TextProps) => {
  return <Text {...props} />;
};

type IBottomSheetTextInput = React.ComponentProps<typeof GorhomBottomSheetInput>;
type BottomSheetTextInputProps = IBottomSheetTextInput &
  VariantProps<typeof bottomSheetTextInputStyle>;

export const BottomSheetTextInput: FC<BottomSheetTextInputProps> = ({
  size,
  variant,
  className,
  ...props
}) => {
  return (
    <GorhomBottomSheetInput
      {...props}
      className={bottomSheetTextInputStyle({ size, variant, className })}
    />
  );
};

export const BottomSheetScrollView = GorhomBottomSheetScrollView;
export const BottomSheetFlatList = GorhomBottomSheetFlatList;
export const BottomSheetSectionList = GorhomBottomSheetSectionList;
export const BottomSheetModal = GorhomBottomSheetModal;
export const BottomSheetModalProvider = GorhomBottomSheetModalProvider;
export const BottomSheetFlashList = GorhomBottomSheetFlashList;

cssInterop(GorhomBottomSheetInput, { className: 'style' });
cssInterop(GorhomBottomSheetScrollView, { className: 'style' });
cssInterop(GorhomBottomSheetFlatList, { className: 'style' });
cssInterop(GorhomBottomSheetSectionList, { className: 'style' });
cssInterop(BottomSheetModal, { className: 'style' });
cssInterop(BottomSheetFlashList, { className: 'style' });
