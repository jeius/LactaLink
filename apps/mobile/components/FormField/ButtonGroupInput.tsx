import { tva } from '@gluestack-ui/nativewind-utils/tva';
import React, { ComponentPropsWithoutRef } from 'react';
import { Button, ButtonGroup, ButtonText } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

const containerStyle = tva({
  base: 'flex-wrap',
});

type TButtonGroup = ComponentPropsWithoutRef<typeof ButtonGroup>;

export type ButtonGroupInputType<TValue> = Omit<TButtonGroup, 'children'> & {
  options: { label: string; value: TValue }[];
  allowMultipleSelection?: boolean;
  selectionLimit?: number;
  isLoading?: boolean;
};

export interface ButtonGroupInputProps<TValue> extends ButtonGroupInputType<TValue> {
  onChange?: (value: TValue | TValue[]) => void;
  value?: TValue | TValue[] | null;
  isInvalid?: boolean;
}

export function ButtonGroupInput<TValue = unknown>({
  allowMultipleSelection,
  selectionLimit,
  options = [],
  value,
  onChange,
  isInvalid,
  flexDirection = 'row',
  className,
  isLoading,
  ...props
}: ButtonGroupInputProps<TValue>) {
  function handleSelectionChange(selectedValue: TValue) {
    if (allowMultipleSelection) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(selectedValue)) {
        // Remove the value if it's already selected
        onChange?.(currentValues.filter((v) => v !== selectedValue));
      } else {
        // Add the value if it's not selected and within limit
        if (selectionLimit === undefined || currentValues.length < selectionLimit) {
          onChange?.([...currentValues, selectedValue]);
        }
      }
    } else {
      // For single selection, just set the value
      onChange?.(selectedValue);
    }
  }

  const isSelected = (option: { value: TValue }) => {
    if (allowMultipleSelection) {
      return Array.isArray(value) && value.includes(option.value);
    }
    return value === option.value;
  };

  return (
    <ButtonGroup
      {...props}
      flexDirection={flexDirection}
      className={containerStyle({ class: className })}
    >
      {(options || []).map((option) =>
        isLoading ? (
          <Skeleton speed={4} variant="rounded" className="h-9 w-24" />
        ) : (
          <Button
            isDisabled={props.isDisabled}
            key={String(option.value)}
            variant={isSelected(option) ? 'solid' : 'outline'}
            action={isInvalid ? 'negative' : 'primary'}
            size="sm"
            onPress={() => {
              handleSelectionChange(option.value);
            }}
          >
            <ButtonText>{option.label}</ButtonText>
          </Button>
        )
      )}
    </ButtonGroup>
  );
}
