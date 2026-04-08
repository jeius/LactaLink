import { LucideIcon } from 'lucide-react-native';
import { FC } from 'react';
import { GestureResponderEvent, ViewProps } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { FlashListProps } from '../../FlashList';
import { InputFieldProps, InputProps } from '../../input';
import { InfiniteFlashListProps, VerticalInfiniteListProps } from '../../list';
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
  onSelect?: (value: T | T[] | null) => void;
}

interface SelectProps<T, TMultiSelect extends boolean = false> extends ActionSheetProps {
  selected?: (TMultiSelect extends true ? T[] : T) | null;
  onSelect?: (value: (TMultiSelect extends true ? T[] : T) | null) => void;
  isMultiSelect?: TMultiSelect;
}

type SelectContentProps = ActionSheetContentProps;

type SelectItemProps<T> = Omit<ActionSheetItemProps, 'onPress'> & {
  value: T;
  onPress?: (value: T, event: GestureResponderEvent) => void;
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

type SelectFlashListProps<T> = FlashListProps<T>;

type SelectInfiniteListProps<T> = InfiniteFlashListProps<T>;

type SelectTriggerProps = ActionSheetTriggerProps;

type SelectIconProps = ActionSheetIconProps;

type SelectTextProps = TextProps;

export type {
  SelectContentProps,
  SelectFlashListProps,
  SelectIconProps,
  SelectInfiniteListProps,
  SelectInputProps,
  SelectItemProps,
  SelectListProps,
  SelectProps,
  SelectSearchInputProps,
  SelectStore,
  SelectTextProps,
  SelectTriggerProps,
};
