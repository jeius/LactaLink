import { AlertCircleIcon } from 'lucide-react-native';
import React, { PropsWithChildren } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
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
  ...props
}: FieldWrapperProps<TFieldValues, TName>) {
  return (
    <FormControl {...props} isInvalid={!!error} isRequired={isRequired}>
      <FieldLabel text={label} isRequired={isRequired} />

      {contentPosition === 'first' ? (
        <>
          {children}
          <FieldHelper text={helperText} />
          <FieldError text={error?.message} />
        </>
      ) : contentPosition === 'last' ? (
        <>
          <FieldHelper text={helperText} />
          <FieldError text={error?.message} />
          {children}
        </>
      ) : (
        <>
          <FieldError text={error?.message} />
          {children}
          <FieldHelper text={helperText} />
        </>
      )}
    </FormControl>
  );
}

export function FieldLabel({ text, isRequired }: { text?: string; isRequired?: boolean }) {
  if (!text) return null;
  return (
    <FormControlLabel>
      <FormControlLabelText>{text}</FormControlLabelText>
      {isRequired && <FormControlLabelAstrick>*</FormControlLabelAstrick>}
    </FormControlLabel>
  );
}

export function FieldError({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <FormControlError>
      <FormControlErrorIcon as={AlertCircleIcon} />
      <FormControlErrorText>{text}</FormControlErrorText>
    </FormControlError>
  );
}

export function FieldHelper({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <FormControlHelper>
      <FormControlHelperText>{text}</FormControlHelperText>
    </FormControlHelper>
  );
}
