import { LucideIcon } from 'lucide-react-native';
import { FC } from 'react';
import { ViewProps } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { InputFieldProps, InputProps } from '../../input';
import { VerticalInfiniteListProps } from '../../list';
import { TextProps } from '../../text';
import {
  ActionSheetContentProps,
  ActionSheetIconProps,
  ActionSheetItemProps,
  ActionSheetProps,
  ActionSheetTriggerProps,
} from '../action-sheet';

interface SelectStore<T> {
  selected: T[] | T | null;
  isMultiSelect: boolean;
  setSelected: (value: T) => void;
}

interface SelectProps<T, TMultiSelect extends boolean = false> extends ActionSheetProps {
  selected?: (TMultiSelect extends true ? T[] : T) | null;
  onSelect?: (value: (TMultiSelect extends true ? T[] : T) | null) => void;
  isMultiSelect?: TMultiSelect;
}

type SelectContentProps = ActionSheetContentProps;

type SelectItemProps<T> = Omit<ActionSheetItemProps, 'onPress'> & {
  value: T;
  onPress?: (value: T) => void;
};

type SelectSearchInputProps = Pick<InputProps, 'size' | 'variant' | 'isDisabled' | 'isFocused'> &
  InputFieldProps & {
    hideClear?: boolean;
    onClear?: () => void;
    showSearchIcon?: boolean;
    containerClassName?: ViewProps['className'];
    containerStyle?: ViewProps['style'];
  };

type SelectInputProps = Pick<
  InputProps,
  'size' | 'variant' | 'isDisabled' | 'isFocused' | 'isInvalid'
> &
  InputFieldProps & {
    iconLeft?: LucideIcon | FC<SvgProps>;
    iconRight?: LucideIcon | FC<SvgProps>;
    containerClassName?: ViewProps['className'];
    containerStyle?: ViewProps['style'];
  };

type SelectListProps<T> = VerticalInfiniteListProps<T>;

type SelectTriggerProps = ActionSheetTriggerProps;

type SelectIconProps = ActionSheetIconProps;

type SelectTextProps = TextProps;

export type {
  SelectContentProps,
  SelectIconProps,
  SelectInputProps,
  SelectItemProps,
  SelectListProps,
  SelectProps,
  SelectSearchInputProps,
  SelectStore,
  SelectTextProps,
  SelectTriggerProps,
};
