import { ChevronDownIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';

import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { SheetDetent } from '@lodev09/react-native-true-sheet';
import { useWindowDimensions } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Select, SelectProps, SelectTextProps } from '../ui/sheet/select';
import { Skeleton } from '../ui/skeleton';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps, Item } from './types';

const MAX_DETENT = 0.45;

const triggerTextStyle = tva({
  base: 'flex-1',
  variants: {
    isPlaceholder: {
      true: 'opacity-70',
    },
  },
});

interface SelectInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  selectInputProps?: SelectTextProps & { placeholder?: string };
  selectProps?: Omit<SelectProps<TFieldValues>, 'isDisabled'> & { itemSize?: number };
  items: Item[];
}

export function SelectInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  isDisabled,
  isLoading,
  selectInputProps,
  items,
  selectProps,
  contentPosition = 'first',
  ...props
}: SelectInputFieldProps<TFieldValues, TName>) {
  const {
    field: { value, onBlur, onChange, disabled },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  const itemMap = useMemo(() => new Map(items.map((i) => [i.value, i.label])), [items]);

  const screen = useWindowDimensions();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const detents = useMemo<SheetDetent[]>(() => {
    const itemSize = selectProps?.itemSize ?? 42;
    const calculatedDetent = (items.length * itemSize + bottomInset + 30) / screen.height;
    return [Math.min(MAX_DETENT, calculatedDetent)];
  }, [bottomInset, items.length, screen.height, selectProps?.itemSize]);

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
        <Select {...selectProps} selected={value} onSelect={onChange} onClose={onBlur}>
          <Select.Trigger disabled={isDisabled || disabled || isSubmitting}>
            <Select.Text
              {...selectInputProps}
              className={triggerTextStyle({
                isPlaceholder: !value,
                className: selectInputProps?.className,
              })}
            >
              {itemMap.get(value) || selectInputProps?.placeholder || 'Select an option...'}
            </Select.Text>
            <Select.Icon as={ChevronDownIcon} />
          </Select.Trigger>

          <Select.Content scrollable detents={detents}>
            <Select.List
              data={items}
              keyExtractor={(item, idx) => `${item.value}-${idx}`}
              nestedScrollEnabled
              renderItem={({ item }) => (
                <Select.Item value={(item as Item).value}>
                  <Select.Text>{item.label}</Select.Text>
                </Select.Item>
              )}
            />
          </Select.Content>
        </Select>
      )}
    </FieldWrapper>
  );
}
