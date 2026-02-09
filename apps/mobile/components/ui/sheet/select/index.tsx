import isEqual from 'lodash/isEqual';
import { ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { Icon } from '../../icon';
import { Input, InputField, InputIcon, InputSlot } from '../../input';
import { VerticalInfiniteList } from '../../list';
import { Text } from '../../text';
import { ActionSheet } from '../action-sheet';
import { initStore, SelectStoreContext, useSelectActionSheetStore } from './context';
import {
  selectIconStyle,
  selectInputFieldStyle,
  selectItemStyle,
  selectTriggerStyle,
} from './styles';
import {
  SelectContentProps,
  SelectIconProps,
  SelectInputProps,
  SelectItemProps,
  SelectListProps,
  SelectProps,
  SelectSearchInputProps,
  SelectStore,
  SelectTextProps,
  SelectTriggerProps,
} from './types';

function SelectSheet<T>({ selected, onSelect, ...props }: SelectProps<T>) {
  const [store] = useState(() => initStore({ selected, setSelected: onSelect }));

  useEffect(() => {
    store.setState({ selected });
  }, [selected, store]);

  return (
    <SelectStoreContext.Provider value={store}>
      <ActionSheet {...props} />
    </SelectStoreContext.Provider>
  );
}

function SelectItem<T>({ value, className, onPress, ...props }: SelectItemProps<T>) {
  const { selected, setSelected } = useSelectActionSheetStore<T, SelectStore<T>>((s) => s);

  const isSelected = isEqual(value, selected);

  const handleSelect = useCallback(() => {
    setSelected(value as T);
    onPress?.(value as T);
  }, [onPress, setSelected, value]);

  return (
    <ActionSheet.Item
      {...props}
      className={selectItemStyle({ className, isSelected })}
      onPress={handleSelect}
    />
  );
}

function SelectSearchInput({
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
}: SelectSearchInputProps) {
  const inputRef = useRef<TextInput>(null);

  const handleClear = useCallback(() => {
    inputRef.current?.clear();
    onClear?.();
    onChangeText?.('');
  }, [onChangeText, onClear]);

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
        // @ts-expect-error Gluestack type issue, safe to ignore
        ref={inputRef}
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
}

function SelectInput({
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
}: SelectInputProps) {
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
      <InputField {...props} className={selectInputFieldStyle({ className })} />
      {iconRight && <InputIcon as={iconRight} className="mr-2" />}
    </Input>
  );
}

function SelectText(props: SelectTextProps) {
  return <Text {...props} />;
}

function SelectContent(props: SelectContentProps) {
  return <ActionSheet.Content {...props} />;
}

function SelectTrigger({ className, ...props }: SelectTriggerProps) {
  return <ActionSheet.Trigger {...props} className={selectTriggerStyle({ className })} />;
}

function SelectIcon({ as = ChevronDownIcon, className, ...props }: SelectIconProps) {
  return <ActionSheet.Icon {...props} as={as} className={selectIconStyle({ className })} />;
}

function SelectList<T>(props: SelectListProps<T>) {
  return <VerticalInfiniteList {...props} />;
}

SelectSheet.displayName = 'SelectSheet';
SelectTrigger.displayName = 'SelectTrigger';
SelectContent.displayName = 'SelectSheet';
SelectItem.displayName = 'SelectItem';
SelectInput.displayName = 'SelectTextInput';
SelectList.displayName = 'SelectList';
SelectIcon.displayName = 'SelectIcon';
SelectText.displayName = 'SelectText';
SelectSearchInput.displayName = 'SelectSearchInput';

const Select = Object.assign(SelectSheet, {
  Content: SelectContent,
  Item: SelectItem,
  List: SelectList,
  Input: SelectInput,
  Search: SelectSearchInput,
  Icon: SelectIcon,
  Trigger: SelectTrigger,
  Text: SelectText,
});

export { Select };
export type {
  SelectContentProps,
  SelectIconProps,
  SelectInputProps,
  SelectItemProps,
  SelectListProps,
  SelectProps,
  SelectSearchInputProps,
  SelectTextProps,
  SelectTriggerProps,
};
