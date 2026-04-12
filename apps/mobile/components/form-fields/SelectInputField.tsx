import { ChevronDownIcon } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';

import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { SheetDetent } from '@lodev09/react-native-true-sheet';
import { useWindowDimensions } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from '../ui/pressable';
import { Select, SelectInputProps, SelectProps } from '../ui/sheet/select';
import { selectItemStyle } from '../ui/sheet/select/styles';
import { Skeleton } from '../ui/skeleton';
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
  triggerInputProps: selectInputProps,
  items,
  selectProps: { dynamicOption, showSelectedIcon = true, ...selectProps } = {},
  contentPosition = 'first',
  transformItem,
  ...props
}: SelectInputFieldProps<TFieldValues, TName, TItem, TMultiSelect>) {
  const {
    field: { value, onBlur, onChange, disabled },
    fieldState: { error, invalid },
    formState: { isSubmitting },
  } = useController({ name, control });

  const itemsMap = useMemo(
    () => new Map(items.map((item) => [transformItem(item).value, item])),
    [items, transformItem]
  );

  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(() => {
    if (Array.isArray(value)) {
      return (value as string[]).some((v) => !itemsMap.has(v));
    }
    return !!value && !itemsMap.has(value as string);
  });

  const [customValue, setCustomValue] = useState<string>(() => {
    if (Array.isArray(value)) {
      return (value as string[]).find((v) => !itemsMap.has(v)) ?? '';
    }
    return !itemsMap.has(value as string) ? ((value as string) ?? '') : '';
  });

  useEffect(() => {
    if (Array.isArray(value)) {
      const unknownVal = (value as string[]).find((v) => !itemsMap.has(v));
      setIsCustomSelected(!!unknownVal);
      setCustomValue(unknownVal ?? '');
    } else {
      const hasCustom = !!value && !itemsMap.has(value as string);
      setIsCustomSelected(hasCustom);
      setCustomValue(hasCustom ? (value as string) : '');
    }
  }, [value, itemsMap]);

  const extraItems = (dynamicOption ? 1 : 0) + (isCustomSelected ? 1 : 0);
  const detents = useDetents(items.length + extraItems, selectProps?.itemSize);

  const handleChange = useCallback(
    (newValue: TItem | TItem[] | null) => {
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
    if (isCustomSelected) {
      setIsCustomSelected(false);
      setCustomValue('');
      if (Array.isArray(value)) {
        onChange((value as string[]).filter((v) => itemsMap.has(v)));
      } else {
        onChange(null);
      }
    } else {
      setIsCustomSelected(true);
      if (Array.isArray(value)) {
        onChange([...(value as string[]), '']);
      } else {
        onChange('');
      }
    }
  }, [isCustomSelected, onChange, value, itemsMap]);

  const handleCustomTextChange = useCallback(
    (text: string) => {
      setCustomValue(text);
      if (Array.isArray(value)) {
        const normalValues = (value as string[]).filter((v) => itemsMap.has(v));
        onChange(text ? [...normalValues, text] : normalValues);
      } else {
        onChange(text || null);
      }
    },
    [onChange, value, itemsMap]
  );

  const handleClose = useCallback(() => {
    onBlur();
    if (isCustomSelected && !customValue) {
      setIsCustomSelected(false);
      if (Array.isArray(value)) {
        onChange((value as string[]).filter((v) => itemsMap.has(v)));
      } else {
        onChange(null);
      }
    }
  }, [onBlur, isCustomSelected, customValue, value, onChange, itemsMap]);

  const disabledFields = isDisabled || disabled || isSubmitting;

  const selectedValue = useMemo(() => {
    if (Array.isArray(value)) {
      return (value as (typeof value)[]).map((v) => itemsMap.get(v)).filter(Boolean) as
        | (TMultiSelect extends true ? TItem[] : TItem)
        | null;
    }
    return (itemsMap.get(value) ?? null) as (TMultiSelect extends true ? TItem[] : TItem) | null;
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
          selected={selectedValue}
          onSelect={handleChange}
          onClose={handleClose}
        >
          <Select.Trigger disabled={disabledFields} className="rounded-xl">
            <Select.Input
              {...selectInputProps}
              value={selectedLabel}
              iconRight={ChevronDownIcon}
              pointerEvents="none"
              containerClassName="flex-1"
              editable={false}
            />
          </Select.Trigger>

          <Select.Content scrollable detents={detents}>
            <Select.FlashList
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
                  <>
                    <Pressable
                      className={selectItemStyle({ isSelected: isCustomSelected })}
                      onPress={handleCustomSelect}
                    >
                      <Select.Text>{dynamicOption.optionLabel ?? 'Other'}</Select.Text>
                    </Pressable>
                    {isCustomSelected && (
                      <Select.Input
                        containerClassName="mx-4 mb-2"
                        autoFocus
                        variant="underlined"
                        value={customValue}
                        placeholder={dynamicOption.optionPlaceholder ?? 'Please specify'}
                        onChangeText={handleCustomTextChange}
                      />
                    )}
                  </>
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

  const detents = useMemo<SheetDetent[]>(() => {
    const calculatedDetent = (itemsLength * itemSize + bottomInset + 30) / screen.height;
    return [Math.min(MAX_DETENT, calculatedDetent)];
  }, [bottomInset, itemsLength, screen.height, itemSize]);
  return detents;
}
