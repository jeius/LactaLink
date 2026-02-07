import { FlashList } from '@shopify/flash-list';
import isEqual from 'lodash/isEqual';
import { ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { Icon } from '../../icon';
import { Input, InputField, InputIcon, InputSlot } from '../../input';
import { ActionSheet } from '../action-sheet';
import { initStore, SelectStoreContext, useSelectActionSheetStore } from './context';
import { selectIconStyle, selectItemStyle, selectTriggerStyle } from './styles';
import {
  SelectContentProps,
  SelectIconProps,
  SelectInputProps,
  SelectItemProps,
  SelectListProps,
  SelectProps,
  SelectStore,
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

function SelectContent(props: SelectContentProps) {
  return <ActionSheet.Content {...props} />;
}

function SelectTrigger({ className, ...props }: SelectTriggerProps) {
  return <ActionSheet.Trigger {...props} className={selectTriggerStyle({ className })} />;
}

function SelectIcon({ as = ChevronDownIcon, className, ...props }: SelectIconProps) {
  return <ActionSheet.Icon {...props} as={as} className={selectIconStyle({ className })} />;
}

function SelectTextInput({
  showSearchIcon,
  hideClear = false,
  isDisabled,
  isFocused,
  isInvalid,
  size,
  variant,
  onClear,
  value = '',
  onChangeText,
  ...props
}: SelectInputProps) {
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
      isInvalid={isInvalid}
    >
      {showSearchIcon && <InputIcon as={SearchIcon} className="ml-2" />}

      {/* @ts-expect-error Gluestack type issue, safe to ignore */}
      <InputField {...props} ref={inputRef} value={value} onChangeText={onChangeText} />

      {!hideClear && value !== '' && (
        <InputSlot className="p-2" onPress={handleClear}>
          <Icon as={XIcon} className="text-typography-700" />
        </InputSlot>
      )}
    </Input>
  );
}

function SelectList<T>({ ...props }: SelectListProps<T>) {
  return <FlashList {...props} />;
}

SelectSheet.displayName = 'SelectSheet';
SelectTrigger.displayName = 'SelectTrigger';
SelectContent.displayName = 'SelectSheet';
SelectItem.displayName = 'SelectItem';
SelectTextInput.displayName = 'SelectTextInput';
SelectList.displayName = 'SelectList';
SelectIcon.displayName = 'SelectIcon';

const Select = Object.assign(SelectSheet, {
  Content: SelectContent,
  Item: SelectItem,
  List: SelectList,
  TextInput: SelectTextInput,
  Icon: SelectIcon,
  Trigger: SelectTrigger,
});

export { Select };
export type {
  SelectContentProps,
  SelectIconProps,
  SelectInputProps,
  SelectItemProps,
  SelectListProps,
  SelectProps,
  SelectTriggerProps,
};
