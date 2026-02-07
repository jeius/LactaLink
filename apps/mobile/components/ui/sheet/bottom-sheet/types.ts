import { TrueSheet, TrueSheetProps } from '@lodev09/react-native-true-sheet';
import { PressableProps, ViewProps } from 'react-native';

export interface SheetStoreActions {
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

  /**
   * Sets the collapsible state of the bottom sheet
   * @param collapse - Whether to disable closing the bottom sheet
   * @returns {void} - No return value
   */
  setCollapsible: (collapse: boolean) => void;

  /**
   * Sets the initial detent index for the bottom sheet
   * @param index - The index of the detent to set as initial
   * @returns {void} - No return value
   */
  setInitialDetentIndex: (index: number | undefined) => void;
}

export interface SheetState {
  /**
   * Whether sheet is currently presented
   */
  presented: boolean;

  /**
   * Whether the bottom sheet can be collapsed, showing only the handle
   * @default false
   */
  collapsible: boolean;

  /**
   * The index of the detent to which the sheet should snap when opened.
   * If not provided, the sheet will expand to the first detent or maximum height.
   */
  initialDetentIndex?: number;

  /**
   * Ref to the BottomSheet instance. When present, it permits calling
   * imperative methods directly on the native component.
   */
  sheetRef: React.RefObject<TrueSheet | null> | null;
}

export type SheetStore = SheetState & {
  /**
   * Actions to manipulate the bottom sheet's state
   */
  actions: SheetStoreActions;
};

export type CreateSheetStore = Partial<SheetState> & {
  actions?: Partial<Omit<SheetStoreActions, 'setInitialDetentIndex' | 'setCollapsible'>>;
};

export interface SheetProps extends Partial<Pick<SheetState, 'collapsible' | 'sheetRef'>> {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export type SheetPortalProps = TrueSheetProps & {
  /**
   * By default, the sheet will dismiss when the back button is pressed.
   * Set this to `false` to disable that behavior.
   * @default true
   */
  dismissOnBackPress?: boolean;
};

export type SheetContentProps = ViewProps;

export type SheetTriggerProps = PressableProps & {
  disablePressAnimation?: boolean;
};
