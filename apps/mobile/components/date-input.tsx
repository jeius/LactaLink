import { formatDate } from '@lactalink/utilities';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CalendarRangeIcon } from 'lucide-react-native';
import React, { ComponentPropsWithoutRef, useState } from 'react';
import { Noop } from 'react-hook-form';

import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Platform } from 'react-native';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { VStack } from './ui/vstack';

const inputStyle = tva({
  base: 'max-w-48',
});

export type DateInputProps<T extends Date | string = string> = ComponentPropsWithoutRef<
  typeof InputField
> & {
  value?: T;
  onChange?: (val: T) => void;
  onBlur?: Noop;
  hideIcon?: boolean;
  disabled?: boolean;
};
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

  function togglePicker() {
    setShowDatePicker((prev) => !prev);
  }

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
