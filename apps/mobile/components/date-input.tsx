import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { formatDate } from '@lactalink/utilities';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CalendarRangeIcon } from 'lucide-react-native';
import React, { ComponentPropsWithoutRef, useState } from 'react';
import { Noop } from 'react-hook-form';
import { Platform } from 'react-native';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { VStack } from './ui/vstack';

const inputStyle = tva({
  base: 'max-w-48',
});

export type DateInputProps<T extends Date | string = string> = ComponentPropsWithoutRef<
  typeof InputField
> & {
  /**
   * The current value of the date input. Can be a `Date` object or a string.
   */
  value?: T;

  /**
   * Callback function triggered when the date is changed.
   *
   * @param val - The new date value as a string or `Date` object.
   */
  onChange?: (val: T) => void;

  /**
   * Callback function triggered when the input loses focus.
   */
  onBlur?: Noop;

  /**
   * Whether to hide the calendar icon in the input field. Defaults to `false`.
   */
  hideIcon?: boolean;

  /**
   * Whether the input is disabled. Defaults to `false`.
   */
  disabled?: boolean;
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
export default function DateInput({
  value,
  onBlur,
  onChange: setDate,
  hideIcon = false,
  disabled: isDisabled,
  className,
  placeholder = 'Select date...',
  ...props
}: DateInputProps) {
  const date = value ? new Date(value) : new Date(1999, 6, 6);
  const [showDatePicker, setShowDatePicker] = useState(false);

  /**
   * Toggles the visibility of the date picker.
   */
  function togglePicker() {
    setShowDatePicker((prev) => !prev);
  }

  /**
   * Handles the date change event from the date picker.
   *
   * @param type - The type of the event (e.g., 'set' or 'dismissed').
   * @param selectedDate - The selected date, if any.
   */
  function onDateChange({ type }: DateTimePickerEvent, selectedDate?: Date) {
    const currentDate = selectedDate;
    if (currentDate && type === 'set') {
      setDate?.(currentDate.toDateString());

      if (Platform.OS === 'android') togglePicker();
    } else {
      togglePicker();
    }
  }

  return (
    <VStack space="md">
      <Input isDisabled={isDisabled} className={inputStyle({ class: className })}>
        {!hideIcon && <InputIcon as={CalendarRangeIcon} className="text-primary-500 ml-3" />}
        <InputSlot onPress={togglePicker} className="w-full">
          <InputField
            {...props}
            onBlur={onBlur}
            value={value ? formatDate(value) : ''}
            aria-disabled={isDisabled}
            placeholder={placeholder}
            textContentType="birthdate"
            editable={false}
            className="w-full"
          />
        </InputSlot>
      </Input>

      {showDatePicker && (
        <DateTimePicker
          mode="date"
          display="spinner"
          value={date}
          minimumDate={new Date(1990, 0, 1)}
          maximumDate={new Date()}
          onChange={onDateChange}
          themeVariant="light"
        />
      )}
    </VStack>
  );
}
