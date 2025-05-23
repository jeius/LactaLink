import React, { ComponentPropsWithoutRef, FC, useState } from 'react';
import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';

import DateInput from '@/components/date-input';
import { OptionsCardItem, OptionsCards } from '@/components/option-cards';
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
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { CollectionSlug } from '@lactalink/types';
import {
  AlertCircleIcon,
  EyeClosedIcon,
  EyeIcon,
  LucideIcon,
  LucideProps,
} from 'lucide-react-native';
import InfiniteScrollComboBox, { InfiniteScrollComboBoxProps } from './combobox';
import { Text } from './ui/text';

type InputType =
  | 'text'
  | 'number'
  | 'password'
  | 'textarea'
  | 'options-cards'
  | 'combobox'
  | 'date';

type TInputField = ComponentPropsWithoutRef<typeof InputField>;
type TInput = ComponentPropsWithoutRef<typeof Input>;
type ComboboxProps<T extends CollectionSlug> = Omit<
  InfiniteScrollComboBoxProps<T>,
  'value' | 'onChange' | 'placeholder'
>;

export type ControlledInputProps<
  T extends FieldValues,
  K extends CollectionSlug = CollectionSlug,
> = TInputField & {
  inputIcon?: FC<LucideProps> | LucideIcon;
  errorIcon?: FC<LucideProps> | LucideIcon;
  name: FieldPath<T>;
  label?: string;
  helperText?: string;
  inputType?: InputType;
  textInputVariant?: TInput['variant'];
  className?: string;
  options?: OptionsCardItem[];
  comboboxProps?: ComboboxProps<K>;
};

export function ControlledInput<T extends FieldValues, K extends CollectionSlug = CollectionSlug>({
  inputIcon,
  errorIcon = AlertCircleIcon,
  name,
  label,
  helperText,
  inputType,
  placeholder,
  className: containerClassName,
  comboboxProps,
  options,
  textInputVariant,
  ...props
}: ControlledInputProps<T, K>) {
  const { trigger, getFieldState } = useFormContext<T>();
  const fieldError = getFieldState(name).error;

  const [showPass, setShowPass] = useState(false);

  return (
    <FormControl isInvalid={!!fieldError}>
      {label && (
        <FormControlLabel>
          <FormControlLabelText>{label}</FormControlLabelText>
        </FormControlLabel>
      )}

      <Controller
        name={name}
        render={({ field }) => {
          switch (inputType) {
            case 'textarea':
              return (
                <Textarea isDisabled={field.disabled} className={containerClassName}>
                  <TextareaInput
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    placeholder={placeholder}
                    style={{ textAlignVertical: 'top' }}
                    multiline
                  />
                </Textarea>
              );

            case 'number':
              return (
                <Input
                  variant={textInputVariant}
                  isDisabled={field.disabled}
                  className={containerClassName}
                >
                  {inputIcon && <InputIcon as={inputIcon} className="text-primary-500 ml-3" />}
                  <InputField
                    {...props}
                    value={field.value ? String(field.value) : ''}
                    onBlur={field.onBlur}
                    onChangeText={(val) => {
                      field.onChange(val ? Number(val) : 0);
                    }}
                    aria-disabled={field.disabled}
                    placeholder={placeholder}
                  />
                </Input>
              );

            case 'password':
              return (
                <Input
                  variant={textInputVariant}
                  isDisabled={field.disabled}
                  className={containerClassName}
                >
                  {inputIcon && <InputIcon as={inputIcon} className="text-primary-500 ml-3" />}
                  <InputField
                    {...props}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    placeholder={placeholder}
                    type={showPass ? 'text' : 'password'}
                  />
                  {field.value && (
                    <InputSlot className="pr-3" onPress={() => setShowPass(!showPass)}>
                      <InputIcon as={showPass ? EyeIcon : EyeClosedIcon} />
                    </InputSlot>
                  )}
                </Input>
              );

            case 'date':
              return (
                <DateInput
                  value={field.value}
                  onBlur={field.onBlur}
                  disabled={field.disabled}
                  onChange={(val) => {
                    field.onChange(val);
                    trigger(name);
                  }}
                />
              );

            case 'options-cards':
              return (
                <OptionsCards
                  value={field.value}
                  onBlur={field.onBlur}
                  isDisabled={field.disabled}
                  items={options}
                  onChange={(val) => {
                    field.onChange(val);
                    trigger(name);
                  }}
                />
              );

            case 'combobox':
              if (!comboboxProps) return <Text>Missing combobox props...</Text>;
              return (
                <InfiniteScrollComboBox
                  {...comboboxProps}
                  value={field.value}
                  isDisabled={field.disabled}
                  placeholder={placeholder}
                  onChange={(val) => {
                    field.onChange(val);
                    trigger(name);
                  }}
                />
              );

            default:
              return (
                <Input
                  variant={textInputVariant}
                  isDisabled={field.disabled}
                  className={containerClassName}
                >
                  {inputIcon && <InputIcon as={inputIcon} className="text-primary-500 ml-3" />}
                  <InputField
                    {...props}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    aria-disabled={field.disabled}
                    placeholder={placeholder}
                  />
                </Input>
              );
          }
        }}
      />

      {helperText && (
        <FormControlHelper>
          <FormControlHelperText>{helperText}</FormControlHelperText>
        </FormControlHelper>
      )}

      <FormControlError>
        <FormControlErrorIcon as={errorIcon} />
        <FormControlErrorText>{fieldError?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
}
