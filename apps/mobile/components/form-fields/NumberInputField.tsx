import React from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { NumberInput, NumberInputType } from '../NumberInput';
import { Skeleton } from '../ui/skeleton';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

interface TextInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  inputProps?: NumberInputType;
}

export function NumberInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  isDisabled,
  isLoading,
  inputProps: { size = 'md', ...inputProps } = {},
  ...props
}: TextInputFieldProps<TFieldValues, TName>) {
  const {
    field: { ref, value, onBlur, onChange, disabled },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  const recyclingKey = `NumberInputField-${name.toString()}`;

  function handleBlur() {
    onBlur();
    inputProps.onBlur?.();
  }

  return (
    <FieldWrapper {...props} error={error} isDisabled={isDisabled || isSubmitting}>
      {isLoading ? (
        <Skeleton variant="rounded" className="h-10" />
      ) : (
        <NumberInput
          {...inputProps}
          ref={ref}
          size={size}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          recyclingKey={recyclingKey}
          isDisabled={isDisabled || disabled || isSubmitting}
        />
      )}
    </FieldWrapper>
  );
}
