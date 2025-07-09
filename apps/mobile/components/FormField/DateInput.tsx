import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { getHexColor } from '@/lib/colors';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { formatDate } from '@lactalink/utilities';
import DateTimePicker, {
  DatePickerOptions,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { CalendarRangeIcon, LucideIcon, LucideProps } from 'lucide-react-native';
import React, { ComponentPropsWithoutRef, FC, useState } from 'react';
import { Noop } from 'react-hook-form';
import { Platform } from 'react-native';
import { Skeleton } from '../ui/skeleton';

const inputStyle = tva({
  base: '',
});

type TInput = Pick<ComponentPropsWithoutRef<typeof Input>, 'variant' | 'className' | 'style'>;

export type DateInputType = TInput & {
  /**
   * Whether to hide the icon in the input field. Defaults to `false`.
   */
  hideIcon?: boolean;
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

  datePickerOptions?: Pick<DatePickerOptions, 'minimumDate' | 'maximumDate'>;
  isLoading?: boolean;
};

export type DateInputProps<T extends string = string> = DateInputType & {
  /**
   * The current value of the date input.
   */
  value?: T;

  /**
   * Callback function triggered when the date is changed.
   *
   * @param val - The new date value as a string.
   */
  onChange?: (val: T) => void;

  /**
   * Callback function triggered when the input loses focus.
   */
  onBlur?: Noop;

  /**
   * Whether the input is disabled. Defaults to `false`.
   */
  isDisabled?: boolean;

  /**
   * Icon to display in the input field.
   * If not provided, a calendar icon will be used by default.
   */
  icon?: FC<LucideProps> | LucideIcon;
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
export function DateInput({
  value,
  onBlur,
  onChange: setDate,
  hideIcon = false,
  isDisabled,
  className,
  style,
  placeholder = 'Select date...',
  mode = 'date',
  icon = CalendarRangeIcon,
  showSetNowButton = false,
  setNowLabel = 'Set Now',
  variant: textInputVariant = 'outline',
  datePickerOptions,
  isLoading,
}: DateInputProps) {
  const date = value ? new Date(value) : new Date(1999, 6, 6);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();
  const accentColor = getHexColor(theme, 'primary', 300)?.toString();

  let inputValue: string = '';

  if (value) {
    switch (mode) {
      case 'datetime':
        inputValue = date.toLocaleString('en-PH');
        break;
      case 'time':
        inputValue = date.toLocaleTimeString('en-PH', {
          hour: '2-digit',
          minute: '2-digit',
        });
        break;
      case 'countdown':
        inputValue = date.toISOString().slice(11, 19);
        break;
      case 'date':
      default:
        inputValue = formatDate(date);
        break;
    }
  }

  function togglePicker() {
    setShowDatePicker((prev) => !prev);
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
    <VStack space="md">
      {isLoading ? (
        <Skeleton className="h-9" />
      ) : (
        <Input
          isDisabled={isDisabled}
          className={inputStyle({ className })}
          style={[{ maxWidth: 200 }, style]}
        >
          {!hideIcon && <InputIcon as={icon} className="text-primary-500 ml-3" />}
          <InputSlot onPress={togglePicker} className="grow">
            <InputField
              onBlur={onBlur}
              value={inputValue}
              aria-disabled={isDisabled}
              placeholder={placeholder}
              textContentType="birthdate"
              editable={false}
              className="w-full"
              variant={textInputVariant}
            />
          </InputSlot>

          {showSetNowButton && (
            <InputSlot>
              <Button
                variant="link"
                size="sm"
                className="pr-3"
                disabled={isDisabled}
                onPress={handleSetNow}
              >
                <ButtonText>{setNowLabel}</ButtonText>
              </Button>
            </InputSlot>
          )}
        </Input>
      )}

      {showDatePicker && (
        <DateTimePicker
          {...datePickerOptions}
          mode={mode}
          display="spinner"
          value={date}
          onChange={onDateChange}
          themeVariant="light"
          locale="en-PH"
          style={{ borderRadius: 20 }}
          accentColor={accentColor}
        />
      )}
    </VStack>
  );
}
