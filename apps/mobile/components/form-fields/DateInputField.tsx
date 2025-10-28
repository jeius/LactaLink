import React from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { DatePicker, DatePickerInputProps } from '../DatePicker';
import { Skeleton } from '../ui/skeleton';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

interface DateInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  datePickerProps?: DatePickerInputProps;
}

export function DateInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  isDisabled,
  isLoading,
  datePickerProps,
  contentPosition = 'middle',
  ...props
}: DateInputFieldProps<TFieldValues, TName>) {
  const {
    field: { value, onBlur, onChange, disabled },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  return (
    <FieldWrapper
      {...props}
      contentPosition={contentPosition}
      error={error}
      isDisabled={isDisabled || isSubmitting}
    >
      {isLoading ? (
        <Skeleton variant="rounded" className="h-10" />
      ) : (
        <DatePicker
          {...datePickerProps}
          isDisabled={isDisabled || disabled || isSubmitting}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      )}
    </FieldWrapper>
  );
}
