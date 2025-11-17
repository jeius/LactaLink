import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { EyeClosedIcon, EyeIcon, LucideIcon, LucideProps } from 'lucide-react-native';
import React, { FC, useState } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { ViewProps } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { BottomSheetInputField } from '../ui/bottom-sheet/input';
import { Input, InputField, InputFieldProps, InputIcon, InputProps } from '../ui/input';
import { Pressable } from '../ui/pressable';
import { Skeleton } from '../ui/skeleton';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

const iconStyle = tva({
  base: 'ml-3',
});

interface TextInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  inputProps?: Omit<InputFieldProps, 'value' | 'onChangeText' | 'size'> &
    Pick<InputProps, 'size'> & {
      containerStyle?: InputProps['style'];
      containerClassName?: InputProps['className'];
      useBottomSheetInput?: boolean;
      icon?: LucideIcon | FC<LucideProps | SvgProps>;
      iconClassName?: ViewProps['className'];
    };
}

export function TextInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  isDisabled,
  isLoading,
  inputProps: {
    size = 'md',
    containerClassName,
    containerStyle,
    useBottomSheetInput = false,
    icon,
    iconClassName,
    type,
    ...inputProps
  } = {},
  ...props
}: TextInputFieldProps<TFieldValues, TName>) {
  const {
    field: { ref, value, onBlur, onChange, disabled },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  const [showPass, setShowPass] = useState(type !== 'password');
  const recyclingKey = `NumberInputField-${name.toString()}`;

  const InputFieldComp = useBottomSheetInput ? BottomSheetInputField : InputField;

  function handleBlur() {
    onBlur();
    inputProps.onBlur?.();
  }

  return (
    <FieldWrapper {...props} error={error} isDisabled={isDisabled || isSubmitting}>
      {isLoading ? (
        <Skeleton variant="rounded" className="h-10" />
      ) : (
        <Input
          ref={ref}
          className={containerClassName}
          style={containerStyle}
          size={size}
          isDisabled={disabled}
          onBlur={handleBlur}
        >
          {icon && (
            <InputIcon
              as={icon}
              recyclingKey={recyclingKey}
              className={iconStyle({ className: iconClassName })}
            />
          )}

          <InputFieldComp
            {...inputProps}
            type={showPass ? 'text' : 'password'}
            secureTextEntry={type === 'password' ? !showPass : inputProps.secureTextEntry}
            value={value || ''}
            onChangeText={onChange}
            recyclingKey={recyclingKey}
          />

          {type === 'password' && value && (
            <Pressable
              className="mr-3"
              hitSlop={8}
              android_ripple={null}
              onPress={(e) => {
                e.stopPropagation();
                setShowPass(!showPass);
              }}
            >
              <InputIcon as={showPass ? EyeIcon : EyeClosedIcon} />
            </Pressable>
          )}
        </Input>
      )}
    </FieldWrapper>
  );
}
