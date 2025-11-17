import BottomSheet, { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { MarkKeyRequired } from '@lactalink/types/utils';
import { ComponentPropsWithoutRef, PropsWithChildren } from 'react';
import { SharedValue } from 'react-native-reanimated';

type IBottomSheetProps = React.ComponentPropsWithoutRef<typeof BottomSheet>;
type IBottomSheetModalProps = Omit<ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'>;
type IBaseBottomSheetProps = {
  /**
   * @deprecated Set snapToIndex in BottomSheet component props instead.
   */
  snapToIndex?: number;
  /**
   * By default, the bottom sheet will collapse when the back button is pressed.
   * Set this to true to disable that behavior.
   * @default false
   */
  disableCollapseOnBackPress?: boolean;
};

export interface BottomSheetActions {
  /**
   * Closes the bottom sheet and updates internal state
   */
  handleClose: () => void;

  /**
   * Opens the bottom sheet to the specified `snapToIndex` (or expands if no index is provided)
   */
  handleOpen: () => void;

  /**
   * Sets the visibility of the bottom sheet
   * @param visible - Whether the bottom sheet should be visible
   * @returns {void} - No return value
   */
  setVisible: (visible: boolean) => void;

  /**
   * Directly sets the snapToIndex of the bottom sheet
   * @param index - The index to snap to
   * @returns {void} - No return value
   */
  setSnapToIndex: (index: number) => void;

  /**
   * Sets the position shared value
   * @param position - The shared value representing the position
   * @returns {void} - No return value
   */
  setPosition: (position: SharedValue<number>) => void;

  /**
   * Sets the current index shared value
   * @param index - The shared value representing the current index
   * @returns {void} - No return value
   */
  setCurrentIndex: (index: SharedValue<number>) => void;

  /**
   * Sets whether closing the bottom sheet is disabled
   * @param disable - Whether to disable closing the bottom sheet
   * @returns {void} - No return value
   */
  setDisableClose: (disable: boolean) => void;
}

export interface BottomSheetStore {
  /**
   * The target index to which the sheet will snap when opened. Typical values
   * correspond to the indices exposed by the bottom sheet's `snapPoints`.
   */
  snapToIndex: number;

  /**
   * Whether the bottom sheet is currently visible
   */
  visible: boolean;

  /**
   * When `true`, the bottom sheet cannot be closed but can only be collapsed
   */
  disableClose: boolean;

  /**
   * A Reanimated shared value representing the sheet's animated vertical
   * position (usually in pixels). Consumers can read this value to drive UI
   * reactions or animations elsewhere.
   */
  position: SharedValue<number>;

  /**
   * A Reanimated shared value representing the currently active snap index.
   * Updates when the sheet snaps to different positions.
   */
  currentIndex: SharedValue<number>;

  /**
   * Ref to the BottomSheet instance. When present, it permits calling
   * imperative methods (for example `snapToIndex` or `close`) directly on the
   * native component.
   */
  bottomSheetRef: React.RefObject<BottomSheet | null> | null;

  /**
   * Ref to a BottomSheetModal instance. Use instead of `bottomSheetRef` when
   * the modal variant is used.
   */
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null> | null;

  /**
   * Actions to manipulate the bottom sheet's state
   */
  actions: BottomSheetActions;
}

export type CreateBottomSheetStore = MarkKeyRequired<
  Partial<Omit<BottomSheetStore, 'actions'>>,
  'position' | 'currentIndex'
> & { actions?: Partial<BottomSheetActions> };

export type BottomSheetState = Pick<
  BottomSheetStore,
  'visible' | 'disableClose' | 'snapToIndex' | 'position' | 'currentIndex'
>;

export interface BottomSheetProps
  extends PropsWithChildren,
    Partial<Pick<BottomSheetStore, 'snapToIndex'>> {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  sheetRef?: React.RefObject<BottomSheet | null>;
  sheetModalRef?: React.RefObject<BottomSheetModal | null>;
  disableClose?: boolean;
}

export interface BottomSheetPortalProps extends Partial<IBottomSheetProps>, IBaseBottomSheetProps {
  /**
   * Whether the bottom sheet is open by default
   */
  defaultIsOpen?: boolean;
}

export interface BottomSheetModalPortalProps
  extends Partial<IBottomSheetModalProps>,
    IBaseBottomSheetProps,
    PropsWithChildren {}
