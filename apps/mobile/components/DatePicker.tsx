import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField, InputIcon, InputProps, InputSlot } from '@/components/ui/input';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import DateTimePicker, {
  DatePickerOptions,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { FC, useState } from 'react';
import { Noop } from 'react-hook-form';
import { Platform } from 'react-native';
import { Box } from './ui/box';

const inputStyle = tva({
  base: '',
});

export type DatePickerInputProps = InputProps & {
  /**
   * Mode of the date input.
   * Defaults to 'date'.
   */
  mode?: 'date' | 'datetime' | 'time' | 'countdown';

  /**
   * Whether to show a button to set the current date and time.
   * Defaults to `false`.
   */
  showSetNowButton?: boolean;

  /**
   * Label for the "Set Now" button.
   * Defaults to 'Set Now'.
   */
  setNowLabel?: string;

  /**
   * Placeholder text for the input field.
   * Defaults to 'Select date...'.
   */
  placeholder?: string;

  /**
   * Icon to display in the input field.
   * If not provided, a calendar icon will be used by default.
   */
  icon?: FC<LucideProps> | LucideIcon;

  /**
   * Date picker options to customize the behavior of the date picker.
   */
  options?: Pick<DatePickerOptions, 'minimumDate' | 'maximumDate' | 'display'>;
};

export type DatePickerProps = DatePickerInputProps & {
  /**
   * The current value of the date input.
   */
  value?: string;

  /**
   * Callback function triggered when the date is changed.
   *
   * @param val - The new date value as a string.
   */
  onChange?: (val: string) => void;

  /**
   * Callback function triggered when the input loses focus.
   */
  onBlur?: Noop;

  /**
   * Whether the input is disabled. Defaults to `false`.
   */
  isDisabled?: boolean;
};

/**
 * A date input component for selecting dates.
 *
 * This component integrates with `@react-native-community/datetimepicker` to provide
 * a date picker interface. It supports both iOS and Android platforms and allows
 * customization of the input field and behavior.
 *
 * @example
 * ```tsx
 * <DateInput
 *   value="2023-05-24"
 *   onChange={(val) => console.log('Selected date:', val)}
 *   placeholder="Select a date"
 * />
 * ```
 */
export function DatePicker({
  value,
  onBlur,
  onChange: setDate,
  isDisabled,
  className,
  placeholder = 'Select date...',
  mode = 'date',
  icon,
  showSetNowButton = false,
  setNowLabel = 'Set Now',
  variant: inputVariant = 'outline',
  size: inputSize = 'md',
  options,
  ...inputProps
}: DatePickerProps) {
  const date = value ? new Date(value) : new Date(1999, 6, 6);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { themeColors, theme } = useTheme();
  const accentColor = themeColors.primary[300];

  let inputValue: string = '';

  if (value) {
    switch (mode) {
      case 'datetime':
        inputValue = `${formatDate(date, { shortMonth: true })}, ${formatLocaleTime(date)}`;
        break;
      case 'time':
        inputValue = formatLocaleTime(date);
        break;
      case 'countdown':
        inputValue = date.toISOString().slice(11, 19);
        break;
      case 'date':
      default:
        inputValue = formatDate(date, { shortMonth: true });
        break;
    }
  }

  function togglePicker() {
    setShowDatePicker((prev) => {
      if (prev) {
        onBlur?.();
      }
      return !prev;
    });
  }

  function onDateChange({ type }: DateTimePickerEvent, selectedDate?: Date) {
    const currentDate = selectedDate;
    if (currentDate && type === 'set') {
      setDate?.(currentDate.toISOString());

      if (Platform.OS === 'android') togglePicker();
    } else {
      togglePicker();
    }
  }

  function handleSetNow() {
    const now = new Date();
    setDate?.(now.toISOString());
  }

  return (
    <Box>
      <Input
        {...inputProps}
        size={inputSize}
        variant={inputVariant}
        isDisabled={isDisabled}
        className={inputStyle({ className })}
      >
        {icon && <InputIcon as={icon} className="text-primary-500 ml-3" />}

        <InputSlot onPress={togglePicker} className="flex-1">
          <InputField
            value={inputValue}
            aria-disabled={isDisabled}
            placeholder={placeholder}
            textContentType="dateTime"
            editable={false}
            pointerEvents="none"
            className="flex-1"
          />
        </InputSlot>

        {showSetNowButton && (
          <InputSlot>
            <Button
              variant="link"
              size="sm"
              className="h-fit w-fit pr-3"
              isDisabled={isDisabled}
              onPress={handleSetNow}
              disablePressAnimation
            >
              <ButtonText>{setNowLabel}</ButtonText>
            </Button>
          </InputSlot>
        )}
      </Input>

      {showDatePicker && (
        <DateTimePicker
          {...options}
          mode={mode}
          display={options?.display || 'spinner'}
          value={date}
          onChange={onDateChange}
          themeVariant={theme}
          locale="en-PH"
          style={{ borderRadius: 20 }}
          accentColor={accentColor}
        />
      )}
    </Box>
  );
}
