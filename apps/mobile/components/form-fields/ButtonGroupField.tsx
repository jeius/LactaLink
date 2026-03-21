import { tva } from '@gluestack-ui/utils/nativewind-utils';
import React, { useCallback } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { Button, ButtonGroup, ButtonGroupProps, ButtonText } from '../ui/button';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

const containerStyle = tva({
  base: 'flex-wrap',
});

const buttonStyle = tva({
  base: '',
  variants: {
    isSelected: {
      true: 'bg-typography-800',
    },
  },
});

const buttonTextStyle = tva({
  base: '',
  variants: {
    isSelected: {
      true: 'text-typography-0',
    },
  },
});

interface ButtonGroupFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  buttonGroupProps?: Omit<ButtonGroupProps, 'children'>;
  allowMultipleSelection?: boolean;
  selectionLimit?: number;
  items: TItem[];
  transformItem: (item: TItem) => {
    value: string;
    label: string;
  };
}

export default function ButtonGroupField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
>({
  control,
  name,
  isDisabled,
  isLoading,
  items,
  transformItem,
  contentPosition = 'first',
  buttonGroupProps: { flexDirection = 'row', ...buttonGroupProps } = {},
  allowMultipleSelection = false,
  selectionLimit,
  ...props
}: ButtonGroupFieldProps<TFieldValues, TName, TItem>) {
  const {
    field: { ref, value, onChange, disabled },
    fieldState: { error, invalid },
    formState: { isSubmitting },
  } = useController({ name, control });

  const handleChange = useCallback(
    (item: TItem) => {
      const newValue = transformItem(item).value;
      if (!allowMultipleSelection) {
        if (newValue !== value) onChange(newValue);
        else onChange(null);
      } else {
        const currentValues = (Array.isArray(value) ? value : []) as string[];
        if (currentValues.includes(newValue)) {
          // Remove the value if it's already selected
          onChange?.(currentValues.filter((v) => v !== newValue));
        } else {
          // Add the value if it's not selected and within limit
          if (selectionLimit === undefined || currentValues.length < selectionLimit) {
            onChange?.([...currentValues, newValue]);
          }
        }
      }
    },
    [allowMultipleSelection, onChange, selectionLimit, transformItem, value]
  );

  const disabledFields = isDisabled || disabled || isSubmitting || isLoading;

  return (
    <FieldWrapper
      {...props}
      contentPosition={contentPosition}
      isInvalid={invalid}
      error={error}
      isDisabled={disabledFields}
    >
      <ButtonGroup
        {...buttonGroupProps}
        ref={ref}
        flexDirection={flexDirection}
        className={containerStyle({ class: buttonGroupProps?.className })}
      >
        {items.map((item, idx) => {
          const { value: itemValue, label } = transformItem(item);
          const isSelected = allowMultipleSelection
            ? Array.isArray(value) && value.includes(itemValue)
            : value === itemValue;

          return (
            <Button
              isDisabled={disabledFields}
              key={`${itemValue}-${idx}`}
              variant="outline"
              action={invalid ? 'negative' : 'default'}
              aria-label={isSelected ? `Deselect ${label}` : `Select ${label}`}
              size="sm"
              className={buttonStyle({ isSelected })}
              onPress={() => handleChange(item)}
            >
              <ButtonText className={buttonTextStyle({ isSelected })}>{label}</ButtonText>
            </Button>
          );
        })}
      </ButtonGroup>
    </FieldWrapper>
  );
}
