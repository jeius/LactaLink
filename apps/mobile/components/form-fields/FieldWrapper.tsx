import { AlertCircleIcon } from 'lucide-react-native';
import React, { PropsWithChildren } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { ViewProps } from 'react-native';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelAstrick,
  FormControlLabelText,
} from '../ui/form-control';
import { BaseFieldProps } from './types';

type BaseFieldTextProps = {
  text?: string | null;
  style?: ViewProps['style'];
  className?: ViewProps['className'];
};

type FieldWrapperProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = PropsWithChildren & Omit<BaseFieldProps<TFieldValues, TName>, 'control' | 'name'>;

export function FieldWrapper<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  children,
  error,
  helperText,
  label,
  contentPosition = 'middle',
  isRequired = false,
  labelClassName,
  labelStyle,
  helperTextClassName,
  helperTextStyle,
  errorTextClassName,
  errorTextStyle,
  ...props
}: FieldWrapperProps<TFieldValues, TName>) {
  return (
    <FormControl {...props} isInvalid={!!error} isRequired={isRequired}>
      <FieldLabel
        text={label}
        isRequired={isRequired}
        style={labelStyle}
        className={labelClassName}
      />

      {contentPosition === 'first' ? (
        <>
          {children}
          <FieldHelper text={helperText} style={helperTextStyle} className={helperTextClassName} />
          <FieldError text={error?.message} style={errorTextStyle} className={errorTextClassName} />
        </>
      ) : contentPosition === 'last' ? (
        <>
          <FieldHelper text={helperText} style={helperTextStyle} className={helperTextClassName} />
          <FieldError text={error?.message} style={errorTextStyle} className={errorTextClassName} />
          {children}
        </>
      ) : (
        <>
          <FieldError text={error?.message} style={errorTextStyle} className={errorTextClassName} />
          {children}
          <FieldHelper text={helperText} style={helperTextStyle} className={helperTextClassName} />
        </>
      )}
    </FormControl>
  );
}

export function FieldLabel({
  text,
  isRequired,
  ...props
}: BaseFieldTextProps & { isRequired?: boolean }) {
  if (!text) return null;
  return (
    <FormControlLabel {...props}>
      <FormControlLabelText>{text}</FormControlLabelText>
      {isRequired && <FormControlLabelAstrick>*</FormControlLabelAstrick>}
    </FormControlLabel>
  );
}

export function FieldError({ text, ...props }: BaseFieldTextProps) {
  if (!text) return null;
  return (
    <FormControlError {...props}>
      <FormControlErrorIcon as={AlertCircleIcon} />
      <FormControlErrorText>{text}</FormControlErrorText>
    </FormControlError>
  );
}

export function FieldHelper({ text, ...props }: BaseFieldTextProps) {
  if (!text) return null;
  return (
    <FormControlHelper {...props}>
      <FormControlHelperText>{text}</FormControlHelperText>
    </FormControlHelper>
  );
}
