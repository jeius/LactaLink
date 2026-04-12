import { ComponentRef, FC, forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';

import { Button, ButtonIcon } from '@/components/ui/button';
import {
  Input,
  InputField,
  InputFieldProps,
  InputIcon,
  InputProps,
  InputSlot,
} from '@/components/ui/input';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { useRecyclingState } from '@shopify/flash-list';
import debounce from 'lodash/debounce';
import { LucideIcon, LucideProps, MinusIcon, PlusIcon } from 'lucide-react-native';
import { type ViewProps } from 'react-native';
import {
  BottomSheetInput,
  BottomSheetInputField,
  BottomSheetInputIcon,
  BottomSheetInputSlot,
} from './ui/bottom-sheet/input';
import { Skeleton } from './ui/skeleton';

const iconStyle = tva({
  base: 'ml-3',
});

type TInputField = Omit<
  InputFieldProps,
  'onChange' | 'value' | 'type' | 'secureTextEntry' | 'size'
>;

type NumberInputType = TInputField & {
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

interface NumberInputProps extends NumberInputType {
  value?: number;
  onChange?: (value?: number) => void;
}

const NumberInput = forwardRef<ComponentRef<typeof InputField>, NumberInputProps>(
  function NumberInput(
    {
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
      onBlur,
      ...props
    },
    ref
  ) {
    const [displayText, setDisplayText] = useRecyclingState(
      value === undefined || value === null ? '' : String(value),
      [recyclingKey]
    );
    const numericValue =
      displayText === '' || isNaN(Number(displayText)) ? undefined : Number(displayText);

    const currentValueRef = useRef<number | undefined>(numericValue);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const InputFieldComp = useBottomSheetInput ? BottomSheetInputField : InputField;
    const InputComp = useBottomSheetInput ? BottomSheetInput : Input;
    const InputIconComp = useBottomSheetInput ? BottomSheetInputIcon : InputIcon;
    const InputSlotComp = useBottomSheetInput ? BottomSheetInputSlot : InputSlot;

    // Keep currentValueRef in sync so interval callbacks always read the latest value.
    useEffect(() => {
      currentValueRef.current = numericValue;
    });

    const handleChange = useMemo(
      () =>
        debounce(
          (numVal?: number) => {
            onChange?.(numVal);
          },
          100,
          { leading: true }
        ),
      [onChange]
    );

    const handleChangeText = useCallback(
      (text: string) => {
        setDisplayText(text);
        let numVal: number | undefined = Number(text);
        if (text === '') numVal = undefined;
        else if (isNaN(numVal)) numVal = 0;
        handleChange(numVal);
      },
      [handleChange, setDisplayText]
    );

    const stopContinuous = useCallback(() => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      onBlur?.();
    }, [onBlur]);

    const handleIncrement = useCallback(() => {
      const newValue = (numericValue ?? 0) + step;
      if (newValue > max) return;
      setDisplayText(String(newValue));
      handleChange(newValue);
      onBlur?.();
    }, [handleChange, max, numericValue, onBlur, setDisplayText, step]);

    const handleDecrement = useCallback(() => {
      const newValue = (numericValue ?? 0) - step;
      if (newValue < min) return;
      setDisplayText(String(newValue));
      handleChange(newValue);
      onBlur?.();
    }, [handleChange, min, numericValue, onBlur, setDisplayText, step]);

    const startContinuousIncrement = useCallback(() => {
      stopContinuous();
      intervalRef.current = setInterval(() => {
        const newValue = (currentValueRef.current ?? 0) + step;
        if (newValue > max) {
          stopContinuous();
          return;
        }
        setDisplayText(String(newValue));
        handleChange(newValue);
      }, 150);
    }, [handleChange, max, setDisplayText, step, stopContinuous]);

    const startContinuousDecrement = useCallback(() => {
      stopContinuous();
      intervalRef.current = setInterval(() => {
        const newValue = (currentValueRef.current ?? 0) - step;
        if (newValue < min) {
          stopContinuous();
          return;
        }
        setDisplayText(String(newValue));
        handleChange(newValue);
      }, 150);
    }, [handleChange, min, setDisplayText, step, stopContinuous]);

    useEffect(() => {
      return () => {
        handleChange.cancel();
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
        }
      };
    }, [handleChange]);

    useEffect(() => {
      setDisplayText(value === undefined || value === null ? '' : String(value));
    }, [value, setDisplayText]);

    return isLoading ? (
      <Skeleton className="h-9" />
    ) : (
      <InputComp
        variant={variant}
        isDisabled={isDisabled}
        style={containerStyle}
        className={containerClassName}
        recyclingKey={recyclingKey}
        size={size}
      >
        {inputIcon && (
          <InputSlotComp>
            <InputIconComp
              as={inputIcon}
              recyclingKey={recyclingKey}
              className={iconStyle({ className: iconClassName })}
            />
          </InputSlotComp>
        )}

        <InputFieldComp
          {...props}
          ref={ref}
          value={displayText}
          onChangeText={handleChangeText}
          aria-disabled={isDisabled}
          placeholder={placeholder}
          recyclingKey={recyclingKey}
          onBlur={onBlur}
          type="text"
          keyboardType="numeric"
          multiline={false}
          numberOfLines={1}
        />

        {showStepButtons && (
          <InputSlotComp>
            <Button
              size="sm"
              variant="ghost"
              action="default"
              isDisabled={isDisabled || (numericValue ?? 0) <= min}
              className="px-3"
              onPress={handleDecrement}
              onLongPress={startContinuousDecrement}
              onPressOut={stopContinuous}
            >
              <ButtonIcon as={MinusIcon} />
            </Button>
          </InputSlotComp>
        )}

        {showStepButtons && (
          <InputSlotComp>
            <Button
              size="sm"
              variant="ghost"
              action="default"
              isDisabled={isDisabled || (numericValue ?? 0) >= max}
              className="px-3"
              onPress={handleIncrement}
              onLongPress={startContinuousIncrement}
              onPressOut={stopContinuous}
            >
              <ButtonIcon as={PlusIcon} />
            </Button>
          </InputSlotComp>
        )}
      </InputComp>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
export type { NumberInputProps, NumberInputType };
