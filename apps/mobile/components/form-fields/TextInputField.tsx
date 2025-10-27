import React from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { BlurEvent } from 'react-native';
import { Input, InputField, InputFieldProps, InputProps } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

interface TextInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  inputProps?: Omit<InputFieldProps, 'value' | 'onChangeText' | 'size'> &
    Pick<InputProps, 'size'> & {
      containerStyle?: InputProps['style'];
      containerClassName?: InputProps['className'];
    };
}

export function TextInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  isDisabled,
  isLoading,
  inputProps: { size = 'md', containerClassName, containerStyle, ...inputProps } = {},
  ...props
}: TextInputFieldProps<TFieldValues, TName>) {
  const {
    field: { value, onBlur, onChange, disabled },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  function handleBlur(e: BlurEvent) {
    onBlur();
    inputProps.onBlur?.(e);
  }

  return (
    <FieldWrapper {...props} error={error} isDisabled={isDisabled || isSubmitting}>
      {isLoading ? (
        <Skeleton variant="rounded" className="h-10" />
      ) : (
        <Input
          className={containerClassName}
          style={containerStyle}
          size={size}
          isDisabled={disabled}
          onBlur={handleBlur}
        >
          <InputField {...inputProps} value={value || ''} onChangeText={onChange} />
        </Input>
      )}
    </FieldWrapper>
  );
}
