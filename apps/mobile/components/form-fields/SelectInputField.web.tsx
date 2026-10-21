import { ChevronDownIcon, CheckIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Pressable } from '../ui/pressable';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

type DynamicOption = { optionLabel?: string; optionPlaceholder?: string };

interface SelectInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
  TMultiSelect extends boolean = false,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  triggerInputProps?: { placeholder?: string; [key: string]: unknown };
  selectProps?: {
    dynamicOption?: DynamicOption | null;
    showSelectedIcon?: boolean;
    isMultiSelect?: TMultiSelect;
    [key: string]: unknown;
  };
  items: TItem[];
  transformItem: (item: TItem) => { value: string; label: string };
}

export function SelectInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
  TMultiSelect extends boolean = false,
>({
  control,
  name,
  isDisabled,
  isLoading,
  triggerInputProps,
  items,
  selectProps,
  contentPosition = 'first',
  transformItem,
  ...props
}: SelectInputFieldProps<TFieldValues, TName, TItem, TMultiSelect>) {
  const [open, setOpen] = useState(false);
  const {
    field: { value, onBlur, onChange, disabled },
    fieldState: { error, invalid },
    formState: { isSubmitting },
  } = useController({ name, control });

  const disabledField = isDisabled || disabled || isSubmitting;
  const isMulti = Boolean(selectProps?.isMultiSelect) || Array.isArray(value);
  const selectedValues = useMemo(
    () => new Set<string>((Array.isArray(value) ? value : value ? [value] : []) as string[]),
    [value]
  );
  const selectedLabel = items
    .filter((item) => selectedValues.has(transformItem(item).value))
    .map((item) => transformItem(item).label)
    .join(', ');

  const choose = (item: TItem) => {
    const option = transformItem(item);
    if (isMulti) {
      const next = new Set(selectedValues);
      if (next.has(option.value)) next.delete(option.value);
      else next.add(option.value);
      onChange(Array.from(next));
    } else {
      onChange(option.value);
      setOpen(false);
      onBlur();
    }
  };

  return (
    <FieldWrapper
      {...props}
      contentPosition={contentPosition}
      isInvalid={invalid}
      error={error}
      isDisabled={disabledField}
    >
      {isLoading ? (
        <Skeleton variant="rounded" className="h-10" />
      ) : (
        <VStack>
          <Pressable
            disabled={disabledField}
            onPress={() => setOpen((current) => !current)}
            className={`rounded-xl border bg-background-0 px-4 py-3 ${
              invalid ? 'border-error-500' : 'border-outline-300'
            }`}
          >
            <HStack className="items-center justify-between">
              <Text className={selectedLabel ? 'text-typography-900' : 'text-typography-500'}>
                {selectedLabel || triggerInputProps?.placeholder || 'Select an option'}
              </Text>
              <Icon as={ChevronDownIcon} size="sm" className="text-typography-600" />
            </HStack>
          </Pressable>

          {open && (
            <VStack className="mt-2 overflow-hidden rounded-xl border border-outline-200 bg-background-0">
              {items.map((item) => {
                const option = transformItem(item);
                const selected = selectedValues.has(option.value);
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => choose(item)}
                    className={`border-b border-outline-100 px-4 py-3 ${selected ? 'bg-primary-50' : ''}`}
                  >
                    <HStack className="items-center justify-between">
                      <Text className={selected ? 'font-JakartaSemiBold text-primary-700' : 'text-typography-800'}>
                        {option.label}
                      </Text>
                      {selected && <Icon as={CheckIcon} size="sm" className="text-primary-600" />}
                    </HStack>
                  </Pressable>
                );
              })}
            </VStack>
          )}
        </VStack>
      )}
    </FieldWrapper>
  );
}
