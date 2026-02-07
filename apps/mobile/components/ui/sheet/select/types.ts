import { FlashListProps } from '@shopify/flash-list';
import { InputFieldProps, InputProps } from '../../input';
import {
  ActionSheetContentProps,
  ActionSheetIconProps,
  ActionSheetItemProps,
  ActionSheetProps,
  ActionSheetTriggerProps,
} from '../action-sheet';

interface SelectStore<T> {
  selected: T | null;
  setSelected: (value: T) => void;
}

interface SelectProps<T> extends ActionSheetProps {
  selected?: T | null;
  onSelect?: (value: T) => void;
}

type SelectContentProps = ActionSheetContentProps;

type SelectItemProps<T> = Omit<ActionSheetItemProps, 'onPress'> & {
  value: T;
  onPress?: (value: T) => void;
};

type SelectInputProps = Pick<
  InputProps,
  'size' | 'variant' | 'isDisabled' | 'isFocused' | 'isInvalid'
> &
  InputFieldProps & {
    hideClear?: boolean;
    onClear?: () => void;
    showSearchIcon?: boolean;
  };

type SelectListProps<T> = FlashListProps<T>;

type SelectTriggerProps = ActionSheetTriggerProps;

type SelectIconProps = ActionSheetIconProps;

export type {
  SelectContentProps,
  SelectIconProps,
  SelectInputProps,
  SelectItemProps,
  SelectListProps,
  SelectProps,
  SelectStore,
  SelectTriggerProps,
};
