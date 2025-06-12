import React, { ComponentPropsWithoutRef, FC } from 'react';

import { Button, ButtonIcon } from '@/components/ui/button';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
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
  return (
    <Input variant={variant} isDisabled={disabled} className={className}>
      {inputIcon && <InputIcon as={inputIcon} className="text-primary-500 ml-3" />}

      {showStepButtons && (
        <InputSlot>
          <Button
            size="sm"
            variant="link"
            isDisabled={disabled || (value || 0) <= min}
            className="px-3"
            onPress={() => {
              onChange?.((value || 0) - (step || 1));
            }}
          >
            <ButtonIcon as={MinusIcon} />
          </Button>
        </InputSlot>
      )}

      <InputField
        {...props}
        className={inputFieldStyle({ isStepButtonsVisible: showStepButtons })}
        defaultValue={value === undefined ? value : String(value)}
        onChangeText={(val) => {
          onChange?.(val ? Number(val) : undefined);
        }}
        aria-disabled={disabled}
        placeholder={placeholder}
      />

      {showStepButtons && (
        <InputSlot>
          <Button
            size="sm"
            variant="link"
            isDisabled={disabled || (value || 0) >= max}
            className="px-3"
            onPress={() => {
              onChange?.((value || 0) + (step || 1));
            }}
          >
            <ButtonIcon as={PlusIcon} />
          </Button>
        </InputSlot>
      )}
    </Input>
  );
}
