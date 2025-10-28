import { ChevronDownIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { useWindowDimensions } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectFlatList,
  SelectIcon,
  SelectInput,
  SelectInputProps,
  SelectItem,
  SelectPortal,
  SelectProps,
  SelectTrigger,
} from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps, Item } from './types';

interface SelectInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  selectInputProps?: Omit<SelectInputProps, 'value' | 'onChangeText' | 'disabled'>;
  selectProps?: Omit<SelectProps, 'isDisabled'>;
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
  selectInputProps: { size = 'md', ...inputProps } = {},
  items,
  selectProps,
  contentPosition = 'first',
  ...props
}: SelectInputFieldProps<TFieldValues, TName>) {
  const insets = useSafeAreaInsets();
  const screen = useWindowDimensions();

  const {
    field: { ref, value, onBlur, onChange, disabled },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  const itemMap = useMemo(() => new Map(items.map((i) => [i.value, i.label])), [items]);

  function handleBlur() {
    onBlur();
  }

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
        <Select
          {...selectProps}
          isDisabled={isDisabled || disabled || isSubmitting}
          selectedValue={value}
          onValueChange={onChange}
          onClose={handleBlur}
        >
          <SelectTrigger size={size}>
            <SelectInput {...inputProps} ref={ref} value={itemMap.get(value) || ''} />
            <SelectIcon className="mr-3" as={ChevronDownIcon} />
          </SelectTrigger>

          <SelectPortal>
            <SelectBackdrop />
            <SelectContent className="px-4" style={{ paddingBottom: insets.bottom }}>
              <SelectDragIndicatorWrapper className="pb-4">
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              <SelectFlatList
                data={items}
                keyExtractor={(item, idx) => `${(item as Item).value}-${idx}`}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: screen.height / 2 }}
                renderItem={({ item }) => (
                  <SelectItem value={(item as Item).value} label={(item as Item).label} />
                )}
              />
            </SelectContent>
          </SelectPortal>
        </Select>
      )}
    </FieldWrapper>
  );
}
