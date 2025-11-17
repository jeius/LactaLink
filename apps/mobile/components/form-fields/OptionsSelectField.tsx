import React from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import OptionsSelect, { OptionsSelectItemType, OptionsSelectType } from '../lists/OptionsSelect';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

interface SelectListFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  listProps?: Omit<OptionsSelectType<TItem>, 'items'>;
  items: OptionsSelectItemType<TItem>[];
}

export function OptionsSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
>({
  control,
  name,
  isDisabled,
  isLoading,
  listProps,
  contentPosition = 'last',
  items,
  ...props
}: SelectListFieldProps<TFieldValues, TName, TItem>) {
  const {
    field: { value, onChange, disabled, onBlur },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  return (
    <FieldWrapper
      {...props}
      contentPosition={contentPosition}
      error={error}
      isDisabled={isDisabled || disabled || isSubmitting}
    >
      <OptionsSelect
        {...listProps}
        items={items}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        isDisabled={isDisabled || disabled || isSubmitting}
      />
    </FieldWrapper>
  );
}
