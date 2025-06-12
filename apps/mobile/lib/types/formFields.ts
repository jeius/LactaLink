import { Input, InputField } from '@/components/ui/input';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import { ComponentPropsWithoutRef, FC } from 'react';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';

type TInput = ComponentPropsWithoutRef<typeof Input>;
type TInputField = ComponentPropsWithoutRef<typeof InputField>;
export type BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Pick<ControllerProps<TFieldValues, TName>, 'name' | 'control'> &
  Omit<TInputField, 'value' | 'onChange'> & {
    /**
     * Icon to display inside the input field.
     */
    inputIcon?: FC<LucideProps> | LucideIcon;

    /**
     * Icon to display for errors.
     */
    errorIcon?: FC<LucideProps> | LucideIcon;

    /**
     * Label for the input field.
     */
    label?: string;

    /**
     * Helper text to display below the input field.
     */
    helperText?: string;

    /**
     * Variant of the input field.
     */
    textInputVariant?: TInput['variant'];

    /**
     * Placeholder text for the input field.
     */
    placeholder?: string;

    /**
     * Class name for the form control container.
     * This is applied to the outermost container of the form control.
     */
    containerClassName?: TInput['className'];

    /**
     * Style for the form control container.
     * This is applied to the outermost container of the form control.
     */
    containerStyle?: TInput['style'];
  };
