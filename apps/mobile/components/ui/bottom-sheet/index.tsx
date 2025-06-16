import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { getHexColor } from '@/lib/colors';
import { VariantProps } from '@gluestack-ui/nativewind-utils';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import GorhomBottomSheet, {
  BottomSheetHandle,
  BottomSheetBackdrop as GorhomBottomSheetBackdrop,
  BottomSheetFlatList as GorhomBottomSheetFlatList,
  BottomSheetTextInput as GorhomBottomSheetInput,
  BottomSheetScrollView as GorhomBottomSheetScrollView,
  BottomSheetSectionList as GorhomBottomSheetSectionList,
  BottomSheetView as GorhomBottomSheetView,
} from '@gorhom/bottom-sheet';
import { FocusScope } from '@react-native-aria/focus';
import { cssInterop } from 'nativewind';
import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PressableProps, TextProps } from 'react-native';
import { Platform, Pressable } from 'react-native';
import { Text } from '../text';

const bottomSheetBackdropStyle = tva({
  base: 'bg-background-0 absolute inset-0 flex-1 touch-none select-none opacity-10',
});

const bottomSheetContentStyle = tva({
  base: '',
});

const bottomSheetTriggerStyle = tva({
  base: '',
});

const bottomSheetIndicatorStyle = tva({
  base: 'bg-background-0 border-outline-100 w-full items-center rounded-t-xl border-b py-4 shadow',
});

const bottomSheetItemStyle = tva({
  base: 'disabled:opacity-0.4 web:pointer-events-auto hover:bg-background-50 active:bg-background-100 focus:bg-background-100 web:focus-visible:bg-background-100 w-full flex-row items-center rounded-sm p-3 disabled:cursor-not-allowed',
});

const bottomSheetTextInputStyle = tva({
  base: 'placeholder:text-typography-600 web:w-full text-typography-900 web:outline-none ios:leading-[0px] pointer-events-none h-full px-3 py-0 font-sans',
  variants: {
    size: {
      xl: 'text-xl',
      lg: 'text-lg',
      md: 'text-base',
      sm: 'text-sm',
    },
    variant: {
      underlined: 'px-0',
      outline: '',
      rounded: 'px-4',
    },
  },
});

const BottomSheetContext = createContext<{
  visible: boolean;
  bottomSheetRef: React.RefObject<GorhomBottomSheet | null>;
  handleClose: () => void;
  handleOpen: () => void;
}>({
  visible: false,
  bottomSheetRef: { current: null },
  handleClose: () => {},
  handleOpen: () => {},
});

type IBottomSheetProps = React.ComponentProps<typeof GorhomBottomSheet>;
export const BottomSheet = ({
  snapToIndex = 1,
  onOpen,
  onClose,
  open,
  setOpen,
  defaultOpen = false,
  sheetRef,
  disableClose = false,
  ...props
}: {
  snapToIndex?: number;
  children?: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  sheetRef?: React.RefObject<GorhomBottomSheet | null>;
  disableClose?: boolean;
}) => {
  const bottomSheetRef = useRef<GorhomBottomSheet>(null);
  const ref = sheetRef || bottomSheetRef;

  const [visible, setVisible] = useState(defaultOpen);

  const handleOpen = useCallback(() => {
    ref.current?.snapToIndex(snapToIndex);
    setVisible(true);
    setOpen?.(true);
    onOpen?.();
  }, [onOpen, ref, setOpen, snapToIndex]);

  const handleClose = useCallback(() => {
    if (!disableClose) ref.current?.close();
    setVisible(false);
    setOpen?.(false);
    onClose?.();
  }, [disableClose, onClose, ref, setOpen]);

  return (
    <BottomSheetContext.Provider
      value={{
        visible: open !== undefined ? open : visible,
        bottomSheetRef: ref,
        handleClose,
        handleOpen,
      }}
    >
      {props.children}
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
  snapPoints: (string | number)[];
}) => {
  const { bottomSheetRef, handleClose } = useContext(BottomSheetContext);
  const { theme } = useTheme();
  const handleIndicatorColor = getHexColor(theme, 'primary', 500);
  const backgroundColor = getHexColor(theme, 'background', 50);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === 0 || index === -1) {
        handleClose();
      }
    },
    [handleClose]
  );

  return (
    <GorhomBottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={snapToIndex}
      backdropComponent={BackDrop}
      onChange={handleSheetChanges}
      handleComponent={DragIndicator}
      handleIndicatorStyle={{ backgroundColor: handleIndicatorColor }}
      backgroundStyle={{ backgroundColor }}
      enablePanDownToClose={enablePanDownToClose}
      {...props}
    >
      {props.children}
    </GorhomBottomSheet>
  );
};

export const BottomSheetTrigger = ({
  className,
  ...props
}: PressableProps & { className?: string }) => {
  const { handleOpen } = useContext(BottomSheetContext);
  return (
    <Pressable
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
    </Pressable>
  );
};
type IBottomSheetBackdrop = React.ComponentProps<typeof GorhomBottomSheetBackdrop>;

export const BottomSheetBackdrop = ({
  disappearsOnIndex = -1,
  appearsOnIndex = 1,
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

cssInterop(GorhomBottomSheetInput, { className: 'style' });
cssInterop(GorhomBottomSheetScrollView, { className: 'style' });
cssInterop(GorhomBottomSheetFlatList, { className: 'style' });
cssInterop(GorhomBottomSheetSectionList, { className: 'style' });
