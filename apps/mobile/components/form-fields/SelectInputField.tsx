import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { SheetDetent } from '@lodev09/react-native-true-sheet';
import { FlashListRef } from '@shopify/flash-list';
import { ChevronDownIcon } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { TextInputEndEditingEvent } from 'react-native';
import { useWindowDimensions } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, InputField } from '../ui/input';
import { Pressable } from '../ui/pressable';
import { Select, SelectInputProps, SelectProps } from '../ui/sheet/select';
import { selectItemStyle } from '../ui/sheet/select/styles';
import { Skeleton } from '../ui/skeleton';
import { VStack } from '../ui/vstack';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

const MAX_DETENT = 0.45;

type DynamicOption = {
  optionLabel?: string;
  optionPlaceholder?: string;
};

interface SelectInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
  TMultiSelect extends boolean = false,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  triggerInputProps?: Omit<SelectInputProps, 'iconLeft' | 'iconRight' | 'value' | 'pointerEvents'>;
  selectProps?: Omit<SelectProps<TItem, TMultiSelect>, 'isDisabled' | 'children'> & {
    itemSize?: number;
    dynamicOption?: DynamicOption | null;
    showSelectedIcon?: boolean;
  };
  items: TItem[];
  transformItem: (item: TItem) => {
    value: string;
    label: string;
  };
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
  selectProps: { dynamicOption, showSelectedIcon = true, itemSize, ...selectProps } = {},
  contentPosition = 'first',
  transformItem,
  ...props
}: SelectInputFieldProps<TFieldValues, TName, TItem, TMultiSelect>) {
  const listRef = useRef<FlashListRef<TItem>>(null);
  const isInternalChangeRef = useRef(false);
  const timeoutIDRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const {
    field: { value, onBlur, onChange, disabled },
    fieldState: { error, invalid },
    formState: { isSubmitting },
  } = useController({ name, control });

  const itemsMap = useMemo(
    () => new Map(items.map((item) => [transformItem(item).value, item])),
    [items, transformItem]
  );

  const disabledFields = isDisabled || disabled || isSubmitting;

  const selectedValue = useMemo(() => {
    if (Array.isArray(value)) {
      return (value as string[]).map((v) => itemsMap.get(v)).filter(Boolean) as TItem[];
    }
    return itemsMap.get(value) ?? null;
  }, [value, itemsMap]);

  const selectedLabel = useMemo(() => {
    if (Array.isArray(selectedValue)) {
      const labels = selectedValue.map((val) => transformItem(val).label);
      if (isCustomSelected && customValue) labels.push(customValue);
      return labels.join(', ');
    }
    if (isCustomSelected && customValue) return customValue;
    return selectedValue ? transformItem(selectedValue as TItem).label : '';
  }, [selectedValue, transformItem, isCustomSelected, customValue]);

  const extraItems = useMemo(
    () => (dynamicOption ? 1 : 0) + (isCustomSelected ? 1 : 0),
    [dynamicOption, isCustomSelected]
  );
  const detents = useDetents(items.length + extraItems, itemSize);

  const handleChange = useCallback(
    (newValue: TItem | TItem[] | null) => {
      isInternalChangeRef.current = true;
      if (Array.isArray(newValue)) {
        const normalValues = newValue.map((item) => transformItem(item).value);
        onChange(isCustomSelected && customValue ? [...normalValues, customValue] : normalValues);
      } else {
        onChange(newValue && transformItem(newValue).value);
      }
    },
    [onChange, transformItem, isCustomSelected, customValue]
  );

  const handleCustomSelect = useCallback(() => {
    isInternalChangeRef.current = true;
    if (isCustomSelected) {
      if (Array.isArray(value)) {
        onChange((value as string[]).filter((v) => itemsMap.has(v)));
      } else {
        onChange(null);
      }
    } else {
      if (Array.isArray(value)) {
        onChange([...(value as string[]), customValue]);
      } else {
        onChange(customValue);
      }
    }
    setIsCustomSelected((prev) => !prev);

    if (timeoutIDRef.current) clearTimeout(timeoutIDRef.current);
    const timeoutID = setTimeout(() => listRef.current?.scrollToEnd(), 100);
    timeoutIDRef.current = timeoutID;
  }, [isCustomSelected, value, onChange, itemsMap, customValue]);

  const handleCustomTextChange = useCallback(
    (e: TextInputEndEditingEvent) => {
      const text = e.nativeEvent.text.trim();
      isInternalChangeRef.current = true;
      if (Array.isArray(value)) {
        const normalValues = (value as string[]).filter((v) => itemsMap.has(v));
        onChange(text ? [...normalValues, text] : normalValues);
      } else {
        onChange(text);
      }
      setCustomValue(text);
    },
    [onChange, value, itemsMap]
  );

  // Sync external value changes (e.g. from form reset) with custom option state.
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }

    if (Array.isArray(value)) {
      const unknownVal = (value as string[]).find((v) => !itemsMap.has(v));
      const hasCustomValue = typeof unknownVal === 'string';
      setIsCustomSelected(hasCustomValue);
      if (hasCustomValue) setCustomValue(unknownVal);
    } else {
      const hasCustomValue = typeof value === 'string' && !itemsMap.has(value);
      setIsCustomSelected(hasCustomValue);
      if (hasCustomValue) setCustomValue(value);
    }
  }, [value, itemsMap]);

  // Cleanup timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutIDRef.current) {
        clearTimeout(timeoutIDRef.current);
        timeoutIDRef.current = null;
      }
    };
  }, []);

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
        <Select
          {...selectProps}
          selected={selectedValue as (TMultiSelect extends true ? TItem[] : TItem) | null}
          onSelect={handleChange}
          onClose={onBlur}
        >
          <Select.Trigger disabled={disabledFields} className="rounded-xl">
            <Select.Input
              {...triggerInputProps}
              value={selectedLabel}
              iconRight={ChevronDownIcon}
              pointerEvents="none"
              containerClassName="flex-1"
              editable={false}
            />
          </Select.Trigger>

          <Select.Content scrollable detents={detents}>
            <Select.FlashList
              ref={listRef}
              data={items}
              keyExtractor={(item, idx) => listKeyExtractor({ id: transformItem(item).value }, idx)}
              nestedScrollEnabled
              renderItem={({ item }) => (
                <Select.Item value={item}>
                  {showSelectedIcon && <Select.Indicator />}
                  <Select.Text>{transformItem(item).label}</Select.Text>
                </Select.Item>
              )}
              ListFooterComponent={
                dynamicOption && (
                  <Pressable
                    className={selectItemStyle({ isSelected: isCustomSelected })}
                    onPress={handleCustomSelect}
                    style={{ alignItems: 'flex-start' }}
                  >
                    <Select.Indicator style={{ opacity: isCustomSelected ? 1 : 0 }} />
                    <VStack className="ml-2 flex-1">
                      <Select.Text>{dynamicOption.optionLabel ?? 'Other'}</Select.Text>

                      {isCustomSelected && (
                        <Input
                          variant="underlined"
                          className="mb-2 border-typography-600 bg-transparent"
                        >
                          <InputField
                            value={customValue}
                            placeholder={dynamicOption.optionPlaceholder ?? 'Please specify'}
                            onChangeText={setCustomValue}
                            onEndEditing={handleCustomTextChange}
                          />
                        </Input>
                      )}
                    </VStack>
                  </Pressable>
                )
              }
            />
          </Select.Content>
        </Select>
      )}
    </FieldWrapper>
  );
}
function useDetents(itemsLength: number, itemSize = 42) {
  const screen = useWindowDimensions();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const detents = useMemo<[SheetDetent]>(() => {
    const calculatedDetent = (itemsLength * itemSize + bottomInset + 30) / screen.height;
    return [Math.min(MAX_DETENT, calculatedDetent)];
  }, [bottomInset, itemsLength, screen.height, itemSize]);
  return detents;
}
