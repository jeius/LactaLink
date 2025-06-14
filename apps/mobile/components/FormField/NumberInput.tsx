import React, { ComponentPropsWithoutRef, FC, useEffect, useState } from 'react';

import { Button, ButtonIcon } from '@/components/ui/button';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { useDebouncedCallback } from '@lactalink/utilities';
import { LucideIcon, LucideProps, MinusIcon, PlusIcon } from 'lucide-react-native';

const inputFieldStyle = tva({
  base: '',
  variants: {
    isStepButtonsVisible: {
      true: 'p-0 text-center',
    },
  },
});

type TInputField = Omit<ComponentPropsWithoutRef<typeof InputField>, 'onChange' | 'value'>;

export type NumberInputType = TInputField & {
  showStepButtons?: boolean;
  step?: number;
  min?: number;
  max?: number;
  icon?: LucideIcon | FC<LucideProps>;
};

export interface NumberInputProps extends NumberInputType {
  value?: number;
  onChange?: (value?: number) => void;
  isDisabled?: boolean;
}

export function NumberInput({
  variant = 'outline',
  icon: inputIcon,
  placeholder,
  className,
  showStepButtons = false,
  step = 1,
  min = 0,
  max = Infinity,
  isDisabled: disabled = false,
  value,
  onChange,
  ...props
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(value);

  const { debounced: handleChange, cancel } = useDebouncedCallback((val?: number) => {
    onChange?.(val);
  }, 300);

  useEffect(() => {
    handleChange(localValue);

    // Cleanup function to cancel any pending debounced calls
    return () => {
      cancel();
    };
  }, [cancel, handleChange, localValue]);

  return (
    <Input variant={variant} isDisabled={disabled} className={className}>
      {inputIcon && <InputIcon as={inputIcon} className="text-primary-500 ml-3" />}

      {showStepButtons && (
        <InputSlot>
          <Button
            size="sm"
            variant="link"
            isDisabled={disabled || (localValue || 0) <= min}
            className="px-3"
            onPress={() => {
              setLocalValue((localValue || 0) - (step || 1));
            }}
          >
            <ButtonIcon as={MinusIcon} />
          </Button>
        </InputSlot>
      )}

      <InputField
        {...props}
        className={inputFieldStyle({ isStepButtonsVisible: showStepButtons })}
        value={localValue === undefined ? localValue : String(localValue)}
        onChangeText={(val) => {
          if (val === '') {
            setLocalValue(undefined);
            return;
          } else if (isNaN(Number(val))) {
            setLocalValue(0);
            return;
          }
          setLocalValue(Number(val));
        }}
        aria-disabled={disabled}
        placeholder={placeholder}
      />

      {showStepButtons && (
        <InputSlot>
          <Button
            size="sm"
            variant="link"
            isDisabled={disabled || (localValue || 0) >= max}
            className="px-3"
            onPress={() => {
              setLocalValue((localValue || 0) + (step || 1));
            }}
          >
            <ButtonIcon as={PlusIcon} />
          </Button>
        </InputSlot>
      )}
    </Input>
  );
}
