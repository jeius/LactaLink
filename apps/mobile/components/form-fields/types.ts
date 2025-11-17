import { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { ViewProps } from 'react-native';
import { FormControlProps } from '../ui/form-control';

export type BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'> &
  Pick<FormControlProps, 'isDisabled' | 'isRequired' | 'style' | 'className'> & {
    label?: string;
    error?: { message?: string } | null;
    helperText?: string;
    contentPosition?: 'first' | 'middle' | 'last';
    isLoading?: boolean;
    labelClassName?: ViewProps['className'];
    labelStyle?: ViewProps['style'];
    helperTextClassName?: ViewProps['className'];
    helperTextStyle?: ViewProps['style'];
    errorTextClassName?: ViewProps['className'];
    errorTextStyle?: ViewProps['style'];
  };

export type Item = { value: string; label: string };
