import {
  AlertCircleIcon,
  CheckCheckIcon,
  CopyMinusIcon,
  EyeClosedIcon,
  EyeIcon,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';

import { OptionsCards } from '@/components/cards/OptionsCards';
import ComboBox from '@/components/Combobox';
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
import { CollectionSlug } from '@lactalink/types/payload-types';

import {
  BottomSheetInput,
  BottomSheetInputField,
  BottomSheetInputIcon,
} from '../ui/bottom-sheet/input';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { ButtonGroupInput, ButtonGroupInputType } from './ButtonGroupInput';
import { DateInput, DateInputType } from './DateInput';
import { ImageUploadField, ImageUploadFieldType } from './ImageField';
import { NumberInput, NumberInputType } from './NumberInput';
import {
  ComboboxProps,
  FieldType,
  FormFieldProps,
  OptionsCardType,
  TInputField,
  TTextareaInput,
} from './types';

const containerStyle = tva({
  base: 'max-w-md',
});

const labelIconStyle = tva({
  base: 'text-typography-900',
});

const labelStyle = tva({
  base: 'gap-2',
});

/**
 * A versatile form field component that integrates with react-hook-form to render various types of input fields.
 * Supports text, password, number, textarea, date, options-cards, button-group, combobox, and image upload fields.
 * @deprecated Use specific field components instead (e.g., `TextInputField`, `TextAreaField`, etc.)
 */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
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
  containerStyle: style,
  labelIcon,
  labelIconProps,
  labelClassName,
  useBottomSheetInputs = false,
  ...props
}: FormFieldProps<TFieldValues, TName, TFieldType, TSlug>) {
  const { trigger, getFieldState, setValue } = useFormContext<TFieldValues>();
  const { isSubmitting, isValidating: _ } = useFormState({ name });

  const currentValue = useWatch({ name });

  const isAllSelected =
    fieldType === 'button-group' &&
    'options' in props &&
    Array.isArray(currentValue) &&
    Array.isArray(props.options) &&
    currentValue.length === props.options.length;

  const { error: fieldError, invalid } = getFieldState(name);

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
    fieldType === 'options-cards' ? (props as unknown as OptionsCardType) : undefined;
  const imageProps = fieldType === 'image' ? (props as ImageUploadFieldType) : undefined;
  const buttonGroupProps =
    fieldType === 'button-group' ? (props as unknown as ButtonGroupInputType<unknown>) : undefined;

  const {
    size: labelIconSize = 'lg',
    className: labelIconClassName,
    ...restOfLabelIconProps
  } = labelIconProps || {};

  function handleSelectAll() {
    if (buttonGroupProps?.allowMultipleSelection) {
      const allOptions = buttonGroupProps.options.map((option) => option.value);
      const newValue = Array.isArray(currentValue || [])
        ? [...new Set([...currentValue, ...allOptions])]
        : allOptions;

      if (isAllSelected) {
        setValue(name, [] as FieldPathValue<TFieldValues, TName>, { shouldValidate: invalid });
      } else {
        setValue(name, newValue as FieldPathValue<TFieldValues, TName>, {
          shouldValidate: invalid,
        });
      }
    }
  }

  return (
    <FormControl
      isInvalid={invalid}
      isDisabled={props.isDisabled || isSubmitting}
      className={containerStyle({ class: containerClassName })}
      style={style}
    >
      {label && (
        <FormControlLabel className={labelStyle({ className: labelClassName })}>
          {labelIcon && (
            <Icon
              {...restOfLabelIconProps}
              as={labelIcon}
              size={labelIconSize}
              className={labelIconStyle({ class: labelIconClassName })}
            />
          )}
          <FormControlLabelText>{label}</FormControlLabelText>
          {imageProps?.showCount && Array.isArray(currentValue) && (
            <FormControlLabelText size="sm" className="font-sans text-typography-700">
              {currentValue.length || 0}/{imageProps.selectionLimit}
            </FormControlLabelText>
          )}
        </FormControlLabel>
      )}

      <Controller
        name={name}
        render={({ field }) => {
          switch (fieldType) {
            case 'textarea': {
              const { className, isLoading, ...rest } = textareaProps || {};
              return isLoading ? (
                <Skeleton className="h-28" />
              ) : (
                <Textarea isDisabled={props.isDisabled || field.disabled} className={className}>
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
                  keyboardType="number-pad"
                  icon={inputIcon}
                  value={field.value}
                  onBlur={field.onBlur}
                  isDisabled={numberFieldProps?.isDisabled || field.disabled}
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
                <Input
                  variant={variant}
                  isDisabled={props.isDisabled || field.disabled}
                  className={className}
                >
                  {inputIcon && <InputIcon as={inputIcon} className="ml-3 text-primary-500" />}
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
                  isDisabled={props.isDisabled || field.disabled}
                  placeholder={placeholder}
                  onChange={(val) => {
                    field.onChange(val);
                    if (invalid) trigger(name);
                  }}
                />
              );

            case 'options-cards':
              return (
                <OptionsCards
                  {...optionsCardsProps}
                  value={field.value}
                  onBlur={field.onBlur}
                  isDisabled={props.isDisabled || field.disabled}
                  containerClassName={containerClassName}
                  onChange={(val) => {
                    field.onChange(val);
                    if (invalid) trigger(name);
                  }}
                />
              );

            case 'button-group': {
              const { options = [], isDisabled, ...props } = buttonGroupProps || {};
              return (
                <ButtonGroupInput
                  {...props}
                  options={options}
                  value={field.value}
                  isDisabled={isDisabled || field.disabled}
                  isInvalid={invalid}
                  onChange={(val) => {
                    field.onChange(val);
                    if (invalid) trigger(name);
                  }}
                />
              );
            }

            case 'combobox':
              if (!comboboxProps) return <Text>Missing combobox props...</Text>;
              return (
                <ComboBox
                  {...comboboxProps}
                  value={field.value}
                  isDisabled={props.isDisabled || field.disabled}
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
                  isDisabled={props.isDisabled || field.disabled || isSubmitting}
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
              const {
                className,
                variant = 'outline',
                isLoading,
                ...restInputProps
              } = inputFieldProps || {};
              const iconMargin = variant === 'underlined' ? 'm-3' : 'ml-3';
              return isLoading ? (
                <Skeleton className="h-9" />
              ) : useBottomSheetInputs ? (
                <BottomSheetInput
                  variant={variant}
                  isDisabled={props.isDisabled || field.disabled}
                  className={className}
                >
                  {inputIcon && (
                    <BottomSheetInputIcon
                      as={inputIcon}
                      className={`text-primary-500 ${iconMargin}`}
                    />
                  )}
                  <BottomSheetInputField
                    {...restInputProps}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    aria-disabled={props.isDisabled || field.disabled}
                    placeholder={placeholder}
                  />
                </BottomSheetInput>
              ) : (
                <Input
                  variant={variant}
                  isDisabled={props.isDisabled || field.disabled}
                  className={className}
                >
                  {inputIcon && (
                    <InputIcon as={inputIcon} className={`text-primary-500 ${iconMargin}`} />
                  )}
                  <InputField
                    {...restInputProps}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    aria-disabled={props.isDisabled || field.disabled}
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

      {buttonGroupProps?.allowMultipleSelection && buttonGroupProps.options.length > 1 && (
        <Box className="mt-2">
          <Button
            size="sm"
            action={isAllSelected ? 'negative' : 'positive'}
            variant={'outline'}
            onPress={handleSelectAll}
            isDisabled={props.isDisabled || isSubmitting}
          >
            <ButtonIcon as={isAllSelected ? CopyMinusIcon : CheckCheckIcon} />
            <ButtonText>{isAllSelected ? 'Unselect All' : 'Select All'}</ButtonText>
          </Button>
        </Box>
      )}
    </FormControl>
  );
}

export { FormField };

export type { ComboboxProps, FieldType, FormFieldProps };
