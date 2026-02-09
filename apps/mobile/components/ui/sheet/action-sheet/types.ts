import { TrueSheet, TrueSheetProps } from '@lodev09/react-native-true-sheet';
import { IconProps } from '../../icon';
import { VerticalInfiniteListProps } from '../../list';
import { PressableProps } from '../../pressable';
import { TextProps } from '../../text';

type SheetRef = React.RefObject<TrueSheet | null>;

interface SheetStoreActions {
  /**
   * Closes the bottom sheet and updates internal state
   */
  handleClose: () => void;

  /**
   * Opens the bottom sheet to the specified `snapToIndex` (or expands if no index is provided)
   */
  handleOpen: () => void;

  /**
   * Sets the presented state of the bottom sheet
   * @param present - Whether the bottom sheet should be visible
   * @returns {void} - No return value
   */
  setPresented: (present: boolean) => void;
}

interface SheetState {
  /**
   * Whether the sheet has been mounted. Useful for avoiding rendering content before the
   * sheet is ready, which can cause issues with measuring and layout on some platforms.
   */
  mounted: boolean;

  /**
   * Whether sheet is currently presented
   */
  presented: boolean;

  /**
   * Ref to the BottomSheet instance. When present, it permits calling
   * imperative methods directly on the native component.
   */
  sheetRef: SheetRef | null;
}

type SheetStore = SheetState & {
  /**
   * Actions to manipulate the bottom sheet's state
   */
  actions: SheetStoreActions;
};

type InitStore = Partial<SheetState> & {
  actions?: Partial<SheetStoreActions>;
};

interface SheetProps extends Partial<Pick<SheetState, 'sheetRef'>> {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

type SheetContentProps = TrueSheetProps;

type SheetListProps<T> = VerticalInfiniteListProps<T>;

type SheetItemProps = PressableProps;

type SheetTriggerProps = PressableProps;

type SheetTextProps = TextProps;

type SheetIconProps = IconProps;

export type {
  SheetContentProps as ActionSheetContentProps,
  SheetIconProps as ActionSheetIconProps,
  SheetItemProps as ActionSheetItemProps,
  SheetListProps as ActionSheetListProps,
  SheetProps as ActionSheetProps,
  SheetRef as ActionSheetRef,
  SheetStoreActions as ActionSheetStoreActions,
  SheetTextProps as ActionSheetTextProps,
  SheetTriggerProps as ActionSheetTriggerProps,
  InitStore,
  SheetState,
  SheetStore,
};
