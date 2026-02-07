import { ChevronDownIcon, XIcon } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';

import { tva } from '@gluestack-ui/nativewind-utils/tva';
import Combobox, { ComboboxProps } from '../ui/Combobox';
import { Icon } from '../ui/icon';
import { Pressable } from '../ui/pressable';
import { Select } from '../ui/sheet/select';
import { Skeleton } from '../ui/skeleton';
import { Spinner } from '../ui/spinner';
import { Text, TextProps } from '../ui/text';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

const triggerTextStyle = tva({
  base: 'flex-1',
  variants: {
    isPlaceholder: {
      true: 'opacity-70',
    },
  },
});

type CBProps<T> = Pick<ComboboxProps<T>, 'listProps' | 'searchInputProps'> &
  Partial<Pick<ComboboxProps<T>, 'renderItem'>>;

export interface ComboboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem extends { id: string } = { id: string },
> extends BaseFieldProps<TFieldValues, TName> {
  triggerInputProps?: TextProps & {
    placeholder?: string;
    label: string | undefined;
    isLoading?: boolean;
  };
  comboboxProps: CBProps<TItem>;
  items: TItem[];
  transformItem: (item: TItem) => {
    value: string;
    label: string;
  };
}

export function ComboboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem extends { id: string } = { id: string },
>({
  control,
  name,
  isDisabled,
  isLoading,
  items,
  transformItem,
  comboboxProps,
  triggerInputProps,
  contentPosition = 'first',
  ...props
}: ComboboxFieldProps<TFieldValues, TName, TItem>) {
  const {
    field: { value, onBlur, onChange, disabled },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  const itemMap = useMemo(
    () => new Map(items.map((item) => [transformItem(item).value, item])),
    [items, transformItem]
  );

  const handleChange = useCallback(
    (newValue: TItem) => onChange(transformItem(newValue).value),
    [onChange, transformItem]
  );

  const handleClear = useCallback(() => onChange(null), [onChange]);

  const disabledFields = isDisabled || disabled || isSubmitting;

  const selectedValue = useMemo(() => value && itemMap.get(value), [value, itemMap]);

  return (
    <FieldWrapper
      {...props}
      contentPosition={contentPosition}
      error={error}
      isDisabled={disabledFields}
    >
      {isLoading ? (
        <Skeleton variant="rounded" className="h-10" />
      ) : (
        <Combobox
          {...comboboxProps}
          items={items}
          selected={selectedValue}
          onSelect={handleChange}
          onClose={onBlur}
          isDisabled={disabledFields}
          detents={[0.5]}
          renderItem={
            comboboxProps?.renderItem ??
            (({ item, isPlaceholder }) =>
              isPlaceholder ? (
                <Skeleton variant="rounded" className="h-6" />
              ) : (
                <Text>{transformItem(item).label}</Text>
              ))
          }
          trigger={
            <>
              <Text
                {...triggerInputProps}
                numberOfLines={triggerInputProps?.numberOfLines ?? 1}
                className={triggerTextStyle({
                  isPlaceholder: !value,
                  className: triggerInputProps?.className,
                })}
              >
                {triggerInputProps?.label ||
                  triggerInputProps?.placeholder ||
                  'Select an option...'}
              </Text>

              {triggerInputProps?.isLoading ? (
                <Spinner size={'small'} className="px-2" />
              ) : (
                !!value && (
                  <Pressable className="px-2" hitSlop={8} onPress={handleClear}>
                    <Icon as={XIcon} className="stroke-error-500" />
                  </Pressable>
                )
              )}

              <Select.Icon as={ChevronDownIcon} />
            </>
          }
        />
      )}
    </FieldWrapper>
  );
}
