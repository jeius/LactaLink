import { ComponentPropsWithoutRef, FC } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';

import { OptionsCardItem } from '@/components/cards/OptionsCards';
import { InputField } from '@/components/ui/input';
import { TextareaInput } from '@/components/ui/textarea';
import { CollectionSlug } from '@lactalink/types';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import { StyleProp, ViewStyle } from 'react-native';
import { ComboboxType } from '../ComboBox';
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

type TInputField = ComponentPropsWithoutRef<typeof InputField>;

type TTextareaInput = ComponentPropsWithoutRef<typeof TextareaInput>;

type ComboboxProps<T extends CollectionSlug> = ComboboxType<T>;

type Options = { options: OptionsCardItem<string | number>[] };

type BaseProps<T extends FieldValues, TFieldType extends FieldType = FieldType> = {
  inputIcon?: FC<LucideProps> | LucideIcon;
  errorIcon?: FC<LucideProps> | LucideIcon;
  labelIcon?: FC<LucideProps> | LucideIcon;
  labelIconProps?: ComponentPropsWithoutRef<typeof Icon>;
  name: FieldPath<T>;
  label?: string;
  helperText?: string;
  fieldType: TFieldType;
  placeholder?: string;
  containerClassName?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

type FormFieldProps<
  T extends FieldValues,
  TFieldType extends FieldType = FieldType,
  TSlug extends CollectionSlug = CollectionSlug,
> = BaseProps<T, TFieldType> &
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
              ? Options
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
  Options,
  TInputField,
  TTextareaInput,
};
