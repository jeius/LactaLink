import OptionsCards from '@/components/option-cards';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { IndividualSchema } from '@lactalink/types';
import { formatDate } from '@lactalink/utilities';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { AlertCircleIcon, BabyIcon, CalendarRangeIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Platform } from 'react-native';
import { genderOptions, maritalStatusOptions } from './options';

export default function IndividualDetails() {
  const {
    control,
    formState: { errors },
    getValues,
    setValue,
    trigger,
  } = useFormContext<IndividualSchema>();

  const [showDatePicker, setShowDatePicker] = useState(false);

  const birthDate = getValues('birth');
  const birth = !isNaN(birthDate?.getTime?.()) ? birthDate : new Date(1999, 0, 1);

  function togglePicker() {
    setShowDatePicker(!showDatePicker);
  }

  const onDateChange = ({ type }: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate;
    if (currentDate && type === 'set') {
      setValue('birth', currentDate, { shouldValidate: true });

      if (Platform.OS === 'android') togglePicker();
    } else {
      togglePicker();
    }
  };

  return (
    <VStack space="lg">
      <FormControl isInvalid={!!errors['givenName']}>
        <FormControlLabel>
          <FormControlLabelText>Given Name</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="givenName"
          render={({ field }) => (
            <Input isDisabled={field.disabled}>
              <InputField
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Enter your given name."
                autoCapitalize="words"
                autoComplete="name-given"
                textContentType="givenName"
                autoCorrect={true}
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{errors.givenName?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <FormControl isInvalid={!!errors['middleName']}>
        <FormControlLabel>
          <FormControlLabelText>Middle Name</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="middleName"
          render={({ field }) => (
            <Input isDisabled={field.disabled}>
              <InputField
                value={field.value || ''}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Enter your middle name."
                autoCapitalize="words"
                autoComplete="name-middle"
                textContentType="middleName"
              />
            </Input>
          )}
        />
        <FormControlHelper>
          <FormControlHelperText>If applicable.</FormControlHelperText>
        </FormControlHelper>
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{errors.middleName?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <FormControl isInvalid={!!errors['familyName']}>
        <FormControlLabel>
          <FormControlLabelText>Family Name</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="familyName"
          render={({ field }) => (
            <Input isDisabled={field.disabled}>
              <InputField
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Enter your family name."
                autoCapitalize="words"
                autoComplete="name-family"
                textContentType="familyName"
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{errors.familyName?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <FormControl isInvalid={!!errors['dependents']}>
        <FormControlLabel>
          <FormControlLabelText>Number of dependents</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="dependents"
          render={({ field }) => (
            <Input isDisabled={field.disabled} className="max-w-32 pl-3">
              <InputIcon as={BabyIcon} className="text-primary-500" />
              <InputField
                onBlur={field.onBlur}
                placeholder="e.g. 2"
                keyboardType="number-pad"
                value={field.value ? String(field.value) : ''}
                onChangeText={(val) => {
                  field.onChange(val ? Number(val) : 0);
                }}
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{errors.dependents?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <FormControl isInvalid={!!errors['birth']}>
        <FormControlLabel>
          <FormControlLabelText>Date of Birth</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="birth"
          render={({ field }) => (
            <Input isDisabled={field.disabled} className="max-w-48 pl-3">
              <InputIcon as={CalendarRangeIcon} className="text-primary-500" />
              <InputSlot onPress={togglePicker} className="w-full">
                <InputField
                  onBlur={field.onBlur}
                  value={field.value ? formatDate(field.value) : ''}
                  aria-disabled={field.disabled}
                  placeholder="Select date"
                  textContentType="birthdate"
                  editable={false}
                  className="w-full"
                />
              </InputSlot>
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{errors.birth?.message}</FormControlErrorText>
        </FormControlError>

        {showDatePicker && (
          <DateTimePicker
            mode="date"
            display="spinner"
            value={birth}
            minimumDate={new Date('1900-1-1')}
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        )}
      </FormControl>

      <FormControl isInvalid={!!errors['gender']}>
        <FormControlLabel>
          <FormControlLabelText>Gender</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <OptionsCards
              selected={field.value}
              onSelectionChange={(val) => {
                field.onChange(val);
                trigger('gender');
              }}
              items={genderOptions}
            />
          )}
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{errors.gender?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <FormControl isInvalid={!!errors['maritalStatus']}>
        <FormControlLabel>
          <FormControlLabelText>Marital Status</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="maritalStatus"
          render={({ field }) => (
            <OptionsCards
              selected={field.value}
              onSelectionChange={(val) => {
                field.onChange(val);
                trigger('maritalStatus');
              }}
              items={maritalStatusOptions}
            />
          )}
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{errors.maritalStatus?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    </VStack>
  );
}
