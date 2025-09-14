import { ComponentPropsWithoutRef, FC } from 'react';
import { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';

import { OptionsCardType } from '@/components/cards/OptionsCards';
import { InputField } from '@/components/ui/input';
import { TextareaInput } from '@/components/ui/textarea';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import { StyleProp, ViewStyle } from 'react-native';
import { ComboboxType } from '../Combobox';
import { Icon } from '../ui/icon';
import { ButtonGroupInputType } from './ButtonGroupInput';
import { DateInputType } from './DateInput';
import { ImageUploadFieldType } from './ImageField';
import { NumberInputType } from './NumberInput';

type FieldType =
  | 'text'
  | 'number'
  | 'password'
  | 'textarea'
  | 'options-cards'
  | 'combobox'
  | 'date'
  | 'button-group'
  | 'image';

type TInputField = ComponentPropsWithoutRef<typeof InputField> & { isLoading?: boolean };

type TTextareaInput = ComponentPropsWithoutRef<typeof TextareaInput> & { isLoading?: boolean };

type ComboboxProps<T extends CollectionSlug> = ComboboxType<T>;

interface BaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TFieldType extends FieldType = FieldType,
> extends Pick<ControllerProps<TFieldValues, TName>, 'control' | 'name'> {
  inputIcon?: FC<LucideProps> | LucideIcon;
  errorIcon?: FC<LucideProps> | LucideIcon;
  labelIcon?: FC<LucideProps> | LucideIcon;
  labelIconProps?: ComponentPropsWithoutRef<typeof Icon>;
  label?: string;
  helperText?: string;
  fieldType: TFieldType;
  placeholder?: string;
  containerClassName?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelClassName?: string;
  useBottomSheetInputs?: boolean;
  isDisabled?: boolean;
}

type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TFieldType extends FieldType = FieldType,
  TSlug extends CollectionSlug = CollectionSlug,
> = BaseProps<TFieldValues, TName, TFieldType> &
  (TFieldType extends 'text' | 'password'
    ? TInputField
    : TFieldType extends 'textarea'
      ? TTextareaInput
      : TFieldType extends 'number'
        ? NumberInputType
        : TFieldType extends 'combobox'
          ? ComboboxProps<TSlug>
          : TFieldType extends 'date'
            ? DateInputType
            : TFieldType extends 'options-cards'
              ? OptionsCardType
              : TFieldType extends 'button-group'
                ? ButtonGroupInputType<unknown>
                : TFieldType extends 'image'
                  ? ImageUploadFieldType
                  : never);

export type {
  BaseProps,
  ComboboxProps,
  FieldType,
  FormFieldProps,
  OptionsCardType,
  TInputField,
  TTextareaInput,
};
