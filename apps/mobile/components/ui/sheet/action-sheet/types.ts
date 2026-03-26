import { RefObject } from 'react';
import { FlashListProps } from '../../FlashList';
import { IconProps } from '../../icon';
import { InfiniteFlashListProps, VerticalInfiniteListProps } from '../../list';
import { PressableProps } from '../../pressable';
import { TextProps } from '../../text';
import { SheetProps as ISheetProps, SheetRef } from '../Sheet';

interface SheetStoreActions {
  /**
   * Handles side effects and state updates when the sheet is closed
   */
  handleOnClose: () => void;

  /**
   * Handles side effects and state updates when the sheet is opened
   */
  handleOnOpen: () => void;

  /**
   * Imperatively present the sheet.
   */
  open: () => void;

  /**
   * Imperatively dismisses the sheet.
   */
  close: () => void;
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
  sheetRef: RefObject<SheetRef | null> | null;
}

type SheetStore = SheetState & {
  /**
   * Actions to manipulate the bottom sheet's state
   */
  actions: SheetStoreActions;
};

type InitStore = Partial<SheetState> & {
  actions?: Partial<Pick<SheetStoreActions, 'handleOnClose' | 'handleOnOpen'>>;
};

interface SheetProps {
  /**
   * @deprecated Use `ref` directly instead.
   */
  sheetRef?: RefObject<SheetRef | null>;
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

type SheetContentProps = ISheetProps;

type SheetListProps<T> = VerticalInfiniteListProps<T>;

type SheetInfiniteListProps<T> = InfiniteFlashListProps<T>;

type SheetFlashListProps<T> = FlashListProps<T>;

type SheetItemProps = PressableProps & { asChild?: boolean };

type SheetTriggerProps = PressableProps & { asChild?: boolean };

type SheetTextProps = TextProps;

type SheetIconProps = IconProps;

export type {
  SheetContentProps as ActionSheetContentProps,
  SheetFlashListProps as ActionSheetFlashListProps,
  SheetIconProps as ActionSheetIconProps,
  SheetInfiniteListProps as ActionSheetInfiniteListProps,
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
