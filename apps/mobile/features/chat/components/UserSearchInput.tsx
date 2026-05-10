import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputProps, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { SearchIcon, XIcon } from 'lucide-react-native';
import { useState } from 'react';

interface UserSearchInputProps extends InputProps {
  value: string;
  onChange: (text: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  autoFocus?: boolean;
}

export default function UserSearchInput({
  value,
  onChange,
  onClear,
  isLoading,
  autoFocus,
  variant = 'rounded',
  ...props
}: UserSearchInputProps) {
  const [inputValue, setInputValue] = useState(value);

  function handleClearSearch() {
    onClear?.();
    setInputValue('');
  }

  function handleChange(text: string) {
    setInputValue(text);
    onChange(text);
  }

  return (
    <Input {...props} variant={variant}>
      <InputIcon as={SearchIcon} className="ml-3" />

      <InputField
        placeholder="Search a user..."
        value={inputValue}
        onChangeText={handleChange}
        keyboardType="web-search"
        role="searchbox"
        autoCorrect={false}
        autoCapitalize="words"
        autoComplete="name"
        className="grow"
        autoFocus={autoFocus}
      />

      {isLoading && (
        <InputSlot className="mr-2">
          <Spinner size="small" />
        </InputSlot>
      )}

      {value && (
        <InputSlot>
          <Pressable
            className="overflow-hidden rounded-full p-2"
            onPress={handleClearSearch}
            hitSlop={8}
          >
            <Icon as={XIcon} />
          </Pressable>
        </InputSlot>
      )}
    </Input>
  );
}
