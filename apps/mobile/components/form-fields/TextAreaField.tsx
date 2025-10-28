import React from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { BlurEvent } from 'react-native';
import { BottomSheetTextInput } from '../ui/bottom-sheet';
import { Skeleton } from '../ui/skeleton';
import { Textarea, TextareaInput, TextareaInputProps, TextareaProps } from '../ui/textarea';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

interface TextAreaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  textareaProps?: Omit<TextareaInputProps, 'value' | 'onChangeText' | 'size' | 'ref'> &
    Pick<TextareaProps, 'size'> & {
      containerStyle?: TextareaProps['style'];
      containerClassName?: TextareaProps['className'];
      useBottomSheetInput?: boolean;
    };
}

export function TextAreaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  isDisabled,
  isLoading,
  textareaProps: {
    size = 'md',
    containerClassName,
    containerStyle,
    useBottomSheetInput,
    ...textareaProps
  } = {},
  contentPosition = 'first',
  ...props
}: TextAreaFieldProps<TFieldValues, TName>) {
  const {
    field: { ref, value, onBlur, onChange, disabled },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  function handleBlur(e: BlurEvent) {
    onBlur();
    textareaProps.onBlur?.(e);
  }

  return (
    <FieldWrapper
      {...props}
      contentPosition={contentPosition}
      error={error}
      isDisabled={isDisabled || isSubmitting}
    >
      {isLoading ? (
        <Skeleton variant="rounded" className="h-28" />
      ) : (
        <Textarea
          ref={ref}
          className={containerClassName}
          style={containerStyle}
          size={size}
          isDisabled={disabled}
          onBlur={handleBlur}
        >
          {useBottomSheetInput ? (
            <BottomSheetTextInput
              {...textareaProps}
              value={value || ''}
              onChangeText={onChange}
              style={[{ textAlignVertical: 'top' }, textareaProps.style]}
              className={textareaProps.className || 'h-24'}
              multiline
            />
          ) : (
            <TextareaInput
              {...textareaProps}
              value={value || ''}
              onChangeText={onChange}
              style={[{ textAlignVertical: 'top' }, textareaProps.style]}
              multiline
            />
          )}
        </Textarea>
      )}
    </FieldWrapper>
  );
}
