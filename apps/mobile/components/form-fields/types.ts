import { LucideIcon } from 'lucide-react-native';
import { FC, PropsWithChildren } from 'react';
import { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { ViewProps } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { FormControlProps } from '../ui/form-control';

export type BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'> &
  Pick<FormControlProps, 'isDisabled' | 'isRequired' | 'style' | 'className' | 'isInvalid'> & {
    label?: string | null;
    error?: { message?: string } | null;
    helperText?: string | null;
    contentPosition?: 'first' | 'middle' | 'last';
    isLoading?: boolean;
    labelClassName?: ViewProps['className'];
    labelStyle?: ViewProps['style'];
    helperTextClassName?: ViewProps['className'];
    helperTextStyle?: ViewProps['style'];
    errorTextClassName?: ViewProps['className'];
    errorTextStyle?: ViewProps['style'];
    labelIcon?: LucideIcon | FC<SvgProps> | null;
    labelIconPosition?: 'start' | 'end';
  };

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = PropsWithChildren<Omit<BaseFieldProps<TFieldValues, TName>, 'control' | 'name'>>;

export type Item = { value: string; label: string };
