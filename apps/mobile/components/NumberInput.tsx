import React, { FC, useEffect, useMemo } from 'react';

import { Button, ButtonIcon } from '@/components/ui/button';
import {
  Input,
  InputField,
  InputFieldProps,
  InputProps,
  InputIcon,
  InputSlot,
} from '@/components/ui/input';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { useRecyclingState } from '@shopify/flash-list';
import { debounce } from 'lodash';
import { LucideIcon, LucideProps, MinusIcon, PlusIcon } from 'lucide-react-native';
import { type ViewProps } from 'react-native';
import { BottomSheetInputField } from './ui/bottom-sheet/input';
import { Skeleton } from './ui/skeleton';

const inputFieldStyle = tva({
  base: '',
  variants: {
    isStepButtonsVisible: {
      true: 'p-0 text-center',
    },
  },
});

const iconStyle = tva({
  base: 'ml-3',
});

type TInputField = Omit<
  InputFieldProps,
  'onChange' | 'value' | 'type' | 'secureTextEntry' | 'size'
>;

export type NumberInputType = TInputField & {
  showStepButtons?: boolean;
  step?: number;
  min?: number;
  max?: number;
  icon?: LucideIcon | FC<LucideProps>;
  iconClassName?: ViewProps['className'];
  isDisabled?: boolean;
  isLoading?: boolean;
  containerStyle?: ViewProps['style'];
  containerClassName?: ViewProps['className'];
  useBottomSheetInput?: boolean;
  size?: InputProps['size'];
};

export interface NumberInputProps extends NumberInputType {
  value?: number;
  onChange?: (value?: number) => void;
}

export function NumberInput({
  variant = 'outline',
  icon: inputIcon,
  placeholder,
  showStepButtons = false,
  step = 1,
  min = 0,
  max = Infinity,
  isDisabled = false,
  value,
  onChange,
  isLoading,
  recyclingKey,
  containerClassName,
  containerStyle,
  useBottomSheetInput = false,
  iconClassName,
  size,
  ...props
}: NumberInputProps) {
  const [localValue, setLocalValue] = useRecyclingState(value, [recyclingKey]);

  const InputFieldComp = useBottomSheetInput ? BottomSheetInputField : InputField;

  const handleChange = useMemo(
    () =>
      debounce((val: string) => {
        let numVal: number | undefined = Number(val);

        if (val === '') numVal = undefined;
        else if (isNaN(numVal)) numVal = 0;

        setLocalValue(numVal);
        onChange?.(numVal);
      }, 100),
    [onChange, setLocalValue]
  );

  useEffect(() => {
    return () => {
      handleChange.cancel();
    };
  }, [handleChange]);

  return isLoading ? (
    <Skeleton className="h-9" />
  ) : (
    <Input
      variant={variant}
      isDisabled={isDisabled}
      style={containerStyle}
      className={containerClassName}
      recyclingKey={recyclingKey}
      size={size}
    >
      {inputIcon && (
        <InputIcon
          as={inputIcon}
          recyclingKey={recyclingKey}
          className={iconStyle({ className: iconClassName })}
        />
      )}

      {showStepButtons && (
        <InputSlot>
          <Button
            size="sm"
            variant="link"
            isDisabled={isDisabled || (localValue ?? 0) <= min}
            className="px-3"
            onPress={() => {
              setLocalValue((localValue ?? 0) - (step || 1));
            }}
          >
            <ButtonIcon as={MinusIcon} />
          </Button>
        </InputSlot>
      )}

      <InputFieldComp
        {...props}
        className={inputFieldStyle({ isStepButtonsVisible: showStepButtons })}
        value={localValue === undefined ? undefined : String(localValue)}
        onChangeText={handleChange}
        aria-disabled={isDisabled}
        placeholder={placeholder}
        recyclingKey={recyclingKey}
        type="text"
        secureTextEntry={false}
      />

      {showStepButtons && (
        <InputSlot>
          <Button
            size="sm"
            variant="link"
            isDisabled={isDisabled || (localValue ?? 0) >= max}
            className="px-3"
            onPress={() => {
              setLocalValue((localValue ?? 0) + (step || 1));
            }}
          >
            <ButtonIcon as={PlusIcon} />
          </Button>
        </InputSlot>
      )}
    </Input>
  );
}
