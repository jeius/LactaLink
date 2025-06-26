import React, { ComponentPropsWithoutRef, FC, useEffect, useState } from 'react';

import { Button, ButtonIcon } from '@/components/ui/button';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { debounce } from 'lodash';
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
  isDisabled?: boolean;
};

export interface NumberInputProps extends NumberInputType {
  value?: number;
  onChange?: (value?: number) => void;
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
  isDisabled = false,
  value,
  onChange,
  ...props
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(value);

  console.log('NumberInput rendered with value:', localValue);

  const handleChange = debounce((val?: number) => {
    onChange?.(val);
  }, 300);

  useEffect(() => {
    handleChange(localValue);

    // Cleanup function to cancel any pending debounced calls
    return () => {
      handleChange.cancel();
    };
  }, [handleChange, localValue]);

  return (
    <Input variant={variant} isDisabled={isDisabled} className={className}>
      {inputIcon && <InputIcon as={inputIcon} className="text-primary-500 ml-3" />}

      {showStepButtons && (
        <InputSlot>
          <Button
            size="sm"
            variant="link"
            isDisabled={isDisabled || (localValue || 0) <= min}
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
        value={localValue === undefined ? undefined : String(localValue)}
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
        aria-disabled={isDisabled}
        placeholder={placeholder}
      />

      {showStepButtons && (
        <InputSlot>
          <Button
            size="sm"
            variant="link"
            isDisabled={isDisabled || (localValue || 0) >= max}
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
