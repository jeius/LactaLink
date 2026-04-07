import { ChevronDownIcon } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';

import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { SheetDetent } from '@lodev09/react-native-true-sheet';
import { useWindowDimensions } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Select, SelectInputProps, SelectProps } from '../ui/sheet/select';
import { Skeleton } from '../ui/skeleton';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

const MAX_DETENT = 0.45;

interface SelectInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
  TMultiSelect extends boolean = false,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  triggerInputProps?: Omit<SelectInputProps, 'iconLeft' | 'iconRight' | 'value' | 'pointerEvents'>;
  selectProps?: Omit<SelectProps<TItem, TMultiSelect>, 'isDisabled' | 'children'> & {
    itemSize?: number;
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
  selectProps,
  contentPosition = 'first',
  transformItem,
  ...props
}: SelectInputFieldProps<TFieldValues, TName, TItem, TMultiSelect>) {
  const {
    field: { value, onBlur, onChange, disabled },
    fieldState: { error, invalid },
    formState: { isSubmitting },
  } = useController({ name, control });

  const detents = useDetents(items.length, selectProps?.itemSize);

  const itemsMap = useMemo(
    () => new Map(items.map((item) => [transformItem(item).value, item])),
    [items, transformItem]
  );

  const handleChange = useCallback(
    (newValue: TItem | TItem[] | null) => {
      if (Array.isArray(newValue)) {
        onChange(newValue.map((item) => transformItem(item).value));
      } else {
        onChange(newValue && transformItem(newValue).value);
      }
    },
    [onChange, transformItem]
  );

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
      return selectedValue.map((val) => transformItem(val).label).join(', ');
    }
    return selectedValue ? transformItem(selectedValue as TItem).label : '';
  }, [selectedValue, transformItem]);

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
        <Select {...selectProps} selected={selectedValue} onSelect={handleChange} onClose={onBlur}>
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
            <Select.List
              data={items}
              keyExtractor={(item, idx) => listKeyExtractor({ id: transformItem(item).value }, idx)}
              nestedScrollEnabled
              renderItem={({ item, isPlaceholder }) =>
                isPlaceholder ? (
                  <Skeleton variant="rounded" className="h-6" />
                ) : (
                  <Select.Item value={item}>
                    <Select.Text>{transformItem(item).label}</Select.Text>
                  </Select.Item>
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
