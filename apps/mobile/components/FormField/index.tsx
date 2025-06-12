import { AlertCircleIcon, EyeClosedIcon, EyeIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, FieldValues, useFormContext, useFormState } from 'react-hook-form';

import { OptionsCards } from '@/components/cards/OptionsCards';
import InfiniteScrollComboBox from '@/components/ComboBox';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
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
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';

import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { CollectionSlug } from '@lactalink/types';

import { DateInput, DateInputType } from './DateInput';
import { ImageUploadField, ImageUploadFieldType } from './ImageField';
import { NumberInput, NumberInputType } from './NumberInput';
import {
  ButtonGroupProps,
  ComboboxProps,
  FieldType,
  FormFieldProps,
  Options,
  TInputField,
  TTextareaInput,
} from './types';

const containerStyle = tva({
  base: 'max-w-md',
});

function FormField<
  T extends FieldValues,
  TFieldType extends FieldType = FieldType,
  TSlug extends CollectionSlug = CollectionSlug,
>({
  inputIcon,
  errorIcon = AlertCircleIcon,
  name,
  label,
  helperText,
  fieldType,
  placeholder,
  containerClassName,
  ...props
}: FormFieldProps<T, TFieldType, TSlug>) {
  const { trigger, getFieldState, getValues } = useFormContext<T>();
  const { isSubmitting, isValidating: _ } = useFormState({ name });

  const value = getValues(name);

  const { error: fieldError, invalid } = getFieldState(name);
  // console.log('Field Error:', name, fieldError);

  const [showPass, setShowPass] = useState(false);

  // Extract props for each field type
  const textareaProps = fieldType === 'textarea' ? (props as TTextareaInput) : undefined;
  const inputFieldProps =
    fieldType === 'text' || fieldType === 'password' ? (props as TInputField) : undefined;
  const numberFieldProps = fieldType === 'number' ? (props as NumberInputType) : undefined;
  const comboboxProps =
    fieldType === 'combobox' ? (props as unknown as ComboboxProps<TSlug>) : undefined;
  const dateInputProps = fieldType === 'date' ? (props as DateInputType) : undefined;
  const optionsCardsProps =
    fieldType === 'options-cards' ? (props as unknown as Options) : undefined;
  const buttonGroupProps =
    fieldType === 'button-group' ? (props as unknown as ButtonGroupProps) : undefined;
  const imageProps = fieldType === 'image' ? (props as ImageUploadFieldType) : undefined;

  return (
    <FormControl
      isInvalid={invalid}
      isDisabled={isSubmitting}
      className={containerStyle({ class: containerClassName })}
    >
      {label && (
        <FormControlLabel className="justify-between">
          <FormControlLabelText>{label}</FormControlLabelText>
          {imageProps?.showCount && Array.isArray(value) && (
            <FormControlLabelText size="sm" className="text-typography-700 font-sans">
              {value.length || 0}/{imageProps.selectionLimit}
            </FormControlLabelText>
          )}
        </FormControlLabel>
      )}

      <Controller
        name={name}
        render={({ field }) => {
          switch (fieldType) {
            case 'textarea': {
              const { className, ...rest } = textareaProps || {};
              return (
                <Textarea isDisabled={field.disabled} className={className}>
                  <TextareaInput
                    {...rest}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    placeholder={placeholder}
                    style={{ textAlignVertical: 'top' }}
                    multiline
                  />
                </Textarea>
              );
            }

            case 'number':
              return (
                <NumberInput
                  {...numberFieldProps}
                  icon={inputIcon}
                  value={field.value}
                  onBlur={field.onBlur}
                  isDisabled={field.disabled}
                  placeholder={placeholder}
                  onChange={(val) => {
                    field.onChange(val);
                    if (invalid) trigger(name);
                  }}
                />
              );

            case 'password': {
              const { className, variant = 'outline', ...restInputProps } = inputFieldProps || {};
              return (
                <Input variant={variant} isDisabled={field.disabled} className={className}>
                  {inputIcon && <InputIcon as={inputIcon} className="text-primary-500 ml-3" />}
                  <InputField
                    {...restInputProps}
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
            }

            case 'date':
              return (
                <DateInput
                  {...dateInputProps}
                  icon={inputIcon}
                  value={field.value}
                  onBlur={field.onBlur}
                  isDisabled={field.disabled}
                  onChange={(val) => {
                    field.onChange(val);
                    if (invalid) trigger(name);
                  }}
                />
              );

            case 'options-cards':
              return (
                <OptionsCards
                  value={field.value}
                  onBlur={field.onBlur}
                  isDisabled={field.disabled}
                  items={optionsCardsProps?.options || []}
                  containerClassName={containerClassName}
                  onChange={(val) => {
                    field.onChange(val);
                    if (invalid) trigger(name);
                  }}
                />
              );

            case 'button-group':
              return (
                <ButtonGroup
                  {...buttonGroupProps}
                  flexDirection="row"
                  className="flex-wrap"
                  isDisabled={field.disabled}
                >
                  {(buttonGroupProps?.options || []).map((option) => (
                    <Button
                      key={option.value}
                      variant={field.value === option.value ? 'solid' : 'outline'}
                      action={invalid ? 'negative' : 'primary'}
                      size="sm"
                      onPress={() => {
                        field.onChange(option.value);
                        if (invalid) trigger(name);
                      }}
                    >
                      <ButtonText>{option.label}</ButtonText>
                    </Button>
                  ))}
                </ButtonGroup>
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
                    if (invalid) trigger(name);
                  }}
                />
              );

            case 'image': {
              return (
                <ImageUploadField
                  {...imageProps}
                  name={name}
                  isDisabled={field.disabled || isSubmitting}
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    if (invalid) trigger(name);
                  }}
                />
              );
            }

            case 'text':
            default: {
              const { className, variant = 'outline', ...restInputProps } = inputFieldProps || {};
              const iconMargin = variant === 'underlined' ? 'm-3' : 'ml-3';
              return (
                <Input variant={variant} isDisabled={field.disabled} className={className}>
                  {inputIcon && (
                    <InputIcon as={inputIcon} className={`text-primary-500 ${iconMargin}`} />
                  )}
                  <InputField
                    {...restInputProps}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    aria-disabled={field.disabled}
                    placeholder={placeholder}
                  />
                </Input>
              );
            }
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

export { FormField };

export type {
  ButtonGroupProps,
  ComboboxProps,
  FieldType,
  FormFieldProps,
  Options,
  TInputField,
  TTextareaInput,
};
