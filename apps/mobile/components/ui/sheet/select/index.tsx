import isEqual from 'lodash/isEqual';
import { ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react-native';
import {
  ComponentRef,
  FC,
  ForwardedRef,
  forwardRef,
  JSX,
  PropsWithoutRef,
  RefAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { GestureResponderEvent, TextInput, View } from 'react-native';
import { FlashList, FlashListRef } from '../../FlashList';
import { Icon } from '../../icon';
import { Input, InputField, InputIcon, InputSlot } from '../../input';
import { InfiniteFlashList, InfiniteFlashListRef, VerticalInfiniteList } from '../../list';
import { Text } from '../../text';
import { ActionSheet } from '../action-sheet';
import { ActionSheetRef } from '../action-sheet/types';
import { initStore, SelectStoreContext, useSelectActionSheetStore } from './context';
import {
  selectIconStyle,
  selectInputFieldStyle,
  selectItemStyle,
  selectTriggerStyle,
} from './styles';
import {
  SelectContentProps,
  SelectFlashListProps,
  SelectIconProps,
  SelectInfiniteListProps,
  SelectInputProps,
  SelectItemProps,
  SelectListProps,
  SelectProps,
  SelectSearchInputProps,
  SelectStore,
  SelectTextProps,
  SelectTriggerProps,
} from './types';

const SelectSheet = forwardRef(function SelectSheet<T, TMultiSelect extends boolean = false>(
  { selected, onSelect, isMultiSelect, ...props }: SelectProps<T, TMultiSelect>,
  ref: ForwardedRef<ActionSheetRef>
) {
  const [store] = useState(() => initStore({ selected, onSelect, isMultiSelect }));

  useEffect(() => {
    store.setState({
      selected,
      isMultiSelect,
      onSelect: (value) => onSelect?.(value as (TMultiSelect extends true ? T[] : T) | null),
    });
  }, [isMultiSelect, onSelect, selected, store]);

  return (
    <SelectStoreContext.Provider value={store}>
      <ActionSheet ref={ref} {...props} />
    </SelectStoreContext.Provider>
  );
}) as <T, TMultiSelect extends boolean = false>(
  props: PropsWithoutRef<SelectProps<T, TMultiSelect>> & RefAttributes<ActionSheetRef>
) => JSX.Element;

const SelectItem = forwardRef(function SelectItem<T>(
  { value, className, onPress, ...props }: SelectItemProps<T>,
  ref: ForwardedRef<View>
) {
  const { selected, setSelected } = useSelectActionSheetStore<T, SelectStore<T>>((s) => s);

  const isSelected = useMemo(() => {
    if (Array.isArray(selected)) {
      return selected.some((item) => isEqual(item, value));
    }
    return isEqual(selected, value);
  }, [selected, value]);

  const handleSelect = useCallback(
    (e: GestureResponderEvent) => {
      setSelected(value as T);
      onPress?.(value as T, e);
    },
    [onPress, setSelected, value]
  );

  return (
    <ActionSheet.Item
      {...props}
      ref={ref}
      className={selectItemStyle({ className, isSelected })}
      onPress={handleSelect}
    />
  );
}) as <T>(props: PropsWithoutRef<SelectItemProps<T>> & RefAttributes<View>) => JSX.Element;

const SelectSearchInput = forwardRef(function SelectSearchInput(
  {
    showSearchIcon,
    hideClear = false,
    isDisabled,
    isFocused,
    size,
    variant,
    onClear,
    value = '',
    onChangeText,
    containerClassName,
    containerStyle,
    className,
    ...props
  }: SelectSearchInputProps,
  ref: ForwardedRef<TextInput>
) {
  const handleClear = useCallback(() => {
    onClear?.();
    onChangeText?.('');
    if (typeof ref === 'object') ref?.current?.clear();
  }, [onChangeText, onClear, ref]);

  return (
    <Input
      size={size}
      variant={variant}
      isDisabled={isDisabled}
      isFocused={isFocused}
      isInvalid={false}
      className={containerClassName}
      style={containerStyle}
    >
      {showSearchIcon && <InputIcon as={SearchIcon} className="ml-2" />}

      <InputField
        {...props}
        ref={ref}
        className={selectInputFieldStyle({ className })}
        value={value}
        onChangeText={onChangeText}
      />

      {!hideClear && value !== '' && (
        <InputSlot className="p-2" onPress={handleClear}>
          <Icon as={XIcon} className="text-typography-700" />
        </InputSlot>
      )}
    </Input>
  );
});

const SelectInput = forwardRef(function SelectInput(
  {
    isDisabled,
    isFocused,
    isInvalid,
    size,
    variant,
    containerClassName,
    containerStyle,
    className,
    iconLeft,
    iconRight,
    ...props
  }: SelectInputProps,
  ref: ForwardedRef<TextInput>
) {
  return (
    <Input
      size={size}
      variant={variant}
      isFocused={isFocused}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
      className={containerClassName}
      style={containerStyle}
      pointerEvents={props.pointerEvents}
    >
      {iconLeft && <InputIcon as={iconLeft} className="ml-2" />}
      <InputField {...props} ref={ref} className={selectInputFieldStyle({ className })} />
      {iconRight && <InputIcon as={iconRight} className="mr-2" />}
    </Input>
  );
});

const SelectText = forwardRef(function SelectText(
  { className, ...props }: SelectTextProps,
  ref: ForwardedRef<ComponentRef<typeof Text>>
) {
  return <Text {...props} ref={ref} className={selectInputFieldStyle({ className })} />;
});

function SelectContent(props: SelectContentProps) {
  return <ActionSheet.Content {...props} />;
}

const SelectTrigger = forwardRef(function SelectTrigger(
  { className, ...props }: SelectTriggerProps,
  ref: ForwardedRef<View>
) {
  return <ActionSheet.Trigger {...props} ref={ref} className={selectTriggerStyle({ className })} />;
});

function SelectIcon({ as = ChevronDownIcon, className, ...props }: SelectIconProps) {
  return <ActionSheet.Icon {...props} as={as} className={selectIconStyle({ className })} />;
}

function SelectList<T>(props: SelectListProps<T>) {
  return <VerticalInfiniteList {...props} />;
}

const SelectInfiniteList = forwardRef(function SelectInfiniteList<T>(
  { ...props }: SelectInfiniteListProps<T>,
  ref: ForwardedRef<InfiniteFlashListRef<T>>
) {
  return <InfiniteFlashList {...props} ref={ref} />;
}) as <T>(
  props: PropsWithoutRef<SelectInfiniteListProps<T>> & RefAttributes<InfiniteFlashListRef<T>>
) => JSX.Element;

const SelectFlashList = forwardRef(function SelectFlashList<T>(
  { ...props }: SelectFlashListProps<T>,
  ref: ForwardedRef<FlashListRef<T>>
) {
  return <FlashList {...props} ref={ref} />;
}) as <T>(
  props: PropsWithoutRef<SelectFlashListProps<T>> & RefAttributes<FlashListRef<T>>
) => JSX.Element;

(SelectSheet as FC).displayName = 'Select';
SelectTrigger.displayName = 'SelectTrigger';
SelectContent.displayName = 'SelectSheet';
(SelectItem as FC).displayName = 'SelectItem';
SelectInput.displayName = 'SelectTextInput';
SelectList.displayName = 'SelectList';
SelectIcon.displayName = 'SelectIcon';
SelectText.displayName = 'SelectText';
SelectSearchInput.displayName = 'SelectSearchInput';
(SelectFlashList as FC).displayName = 'SelectFlashList';
(SelectInfiniteList as FC).displayName = 'SelectInfiniteList';

const Select = SelectSheet as typeof SelectSheet & {
  Trigger: typeof SelectTrigger;
  Content: typeof SelectContent;
  Item: typeof SelectItem;
  Input: typeof SelectInput;
  Text: typeof SelectText;
  Icon: typeof SelectIcon;
  List: typeof SelectList;
  FlashList: typeof SelectFlashList;
  InfiniteList: typeof SelectInfiniteList;
  SearchInput: typeof SelectSearchInput;
};

Select.Trigger = SelectTrigger;
Select.Content = SelectContent;
Select.Item = SelectItem;
Select.Input = SelectInput;
Select.Text = SelectText;
Select.Icon = SelectIcon;
Select.List = SelectList;
Select.FlashList = SelectFlashList;
Select.InfiniteList = SelectInfiniteList;
Select.SearchInput = SelectSearchInput;

export { Select };
export type {
  SelectContentProps,
  SelectFlashListProps,
  SelectIconProps,
  SelectInfiniteListProps,
  SelectInputProps,
  SelectItemProps,
  SelectListProps,
  SelectProps,
  SelectSearchInputProps,
  SelectTextProps,
  SelectTriggerProps,
};
