import { ChevronDownIcon, XIcon } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';

import Combobox, { ComboboxProps } from '../ui/Combobox';
import { Icon } from '../ui/icon';
import { Input, InputField, InputFieldProps, InputIcon } from '../ui/input';
import { Pressable } from '../ui/pressable';
import { Skeleton } from '../ui/skeleton';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

type CBProps<T> = Pick<ComboboxProps<T>, 'listProps' | 'searchInputProps'> &
  Partial<Pick<ComboboxProps<T>, 'renderItem'>>;

export interface ComboboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'isInvalid'> {
  triggerInputProps?: Pick<InputFieldProps, 'placeholder'> & {
    value: string | undefined;
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
  TItem = unknown,
>({
  control,
  name,
  isDisabled,
  isLoading,
  items,
  transformItem,
  comboboxProps,
  triggerInputProps: { value: label, isLoading: triggerLoading, ...triggerInputProps } = {
    value: '',
  },
  contentPosition = 'first',
  ...props
}: ComboboxFieldProps<TFieldValues, TName, TItem>) {
  const {
    field: { ref, value, onBlur, onChange, disabled },
    fieldState: { error, invalid },
    formState: { isSubmitting },
  } = useController({ name, control });

  const itemMap = useMemo(
    () => new Map(items.map((item) => [transformItem(item).value, item])),
    [items, transformItem]
  );

  const handleChange = useCallback(
    (newValue: TItem | null) => onChange(newValue && transformItem(newValue).value),
    [onChange, transformItem]
  );

  const handleClear = useCallback(() => onChange(null), [onChange]);

  const disabledFields = isDisabled || disabled || isSubmitting;

  const selectedValue = useMemo(() => value && itemMap.get(value), [value, itemMap]);

  return (
    <FieldWrapper
      {...props}
      contentPosition={contentPosition}
      isInvalid={invalid}
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
          triggerContainerClassName="rounded-lg"
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
            <Input
              ref={ref}
              isDisabled={disabledFields}
              isInvalid={invalid}
              className="flex-1"
              pointerEvents="box-none"
            >
              <InputField
                {...triggerInputProps}
                className="flex-1"
                value={label ?? ''}
                editable={false}
                pointerEvents="none"
              />

              {triggerLoading ? (
                <Spinner size={'small'} className="px-2" />
              ) : (
                !!value && (
                  <Pressable className="px-2" hitSlop={8} onPress={handleClear}>
                    <Icon as={XIcon} className="stroke-error-500" />
                  </Pressable>
                )
              )}

              <InputIcon as={ChevronDownIcon} className="mr-2" />
            </Input>
          }
        />
      )}
    </FieldWrapper>
  );
}
