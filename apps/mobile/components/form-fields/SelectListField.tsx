import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractID } from '@lactalink/utilities/extractors';
import React, { useMemo } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { FlatListProps } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { AnimatedPressable } from '../animated/pressable';
import { Box } from '../ui/box';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

const flatlistStyle = tva({
  base: 'mt-2',
});

const contentContainerClassName = tva({
  base: 'px-5',
});

interface SelectListFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem extends { id: string } = { id: string },
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  listProps?: Omit<FlatListProps<TItem>, 'data' | 'renderItem'>;
  placeholderCount?: number;
  itemGap?: number;
  items: TItem[];
  renderItem: (
    item: TItem,
    index: number,
    extra: { isSelected: boolean; isLoading: boolean }
  ) => React.ReactNode;
}

export function SelectListField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem extends { id: string } = { id: string },
>({
  control,
  name,
  isDisabled,
  isLoading,
  listProps,
  contentPosition = 'last',
  placeholderCount = 6,
  itemGap = 12,
  items,
  renderItem,
  ...props
}: SelectListFieldProps<TFieldValues, TName, TItem>) {
  const {
    field: { value, onChange, disabled },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  const placeholder = useMemo(
    () => generatePlaceHoldersWithID(placeholderCount, {} as TItem),
    [placeholderCount]
  );

  return (
    <FieldWrapper
      {...props}
      contentPosition={contentPosition}
      error={error}
      isDisabled={isDisabled || disabled || isSubmitting}
    >
      <FlatList
        {...listProps}
        data={isLoading ? placeholder : items}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
        showsHorizontalScrollIndicator={listProps?.showsHorizontalScrollIndicator || false}
        className={flatlistStyle({ className: listProps?.className })}
        contentContainerClassName={contentContainerClassName({
          className: listProps?.contentContainerClassName,
        })}
        ItemSeparatorComponent={() => (
          <Box style={listProps?.horizontal ? { width: itemGap } : { height: itemGap }} />
        )}
        renderItem={({ item, index }) => {
          const isPlaceholder = isPlaceHolderData(item);
          const isSelected = !isPlaceholder && extractID(value) === item.id;
          return (
            <AnimatedPressable
              onPress={!isPlaceholder ? () => onChange(isSelected ? null : item) : undefined}
              className="overflow-hidden rounded-2xl"
              disabled={isDisabled || disabled || isSubmitting}
            >
              {renderItem(item, index, { isSelected, isLoading: isPlaceholder })}
            </AnimatedPressable>
          );
        }}
      />
    </FieldWrapper>
  );
}
