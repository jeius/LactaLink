import { CheckboxField } from '@/components/form-fields/CheckboxField';
import { DateInputField } from '@/components/form-fields/DateInputField';
import { NumberInputField } from '@/components/form-fields/NumberInputField';
import RadioGroupField from '@/components/form-fields/RadioGroupField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { BaseFieldProps } from '@/components/form-fields/types';
import { DonorScreeningFormField } from '@lactalink/types/collections';
import { FieldWidth } from '@lactalink/types/payload-generated-types';
import { Control } from 'react-hook-form';
import { StyleProp, ViewStyle } from 'react-native';

const widthMap: Record<NonNullable<FieldWidth>, `${number}%`> = {
  full: '100%',
  '3/4': '75%',
  '2/3': '66%',
  '1/2': '50%',
  '1/3': '33%',
  '1/4': '25%',
};

interface FieldBlockProps {
  field: Exclude<DonorScreeningFormField, { blockType: 'message' }>;
  control: Control;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function FieldBlock({ field, control, style, className }: FieldBlockProps) {
  const baseProps: BaseFieldProps = {
    control: control,
    name: field.name,
    label: field.label,
    helperText: field.helperText,
    isRequired: field.required ?? false,
    contentPosition: 'first',
    style,
    className,
  };

  switch (field.blockType) {
    case 'email': {
      if (field.hidden) return null;
      return (
        <TextInputField
          {...baseProps}
          inputProps={{
            placeholder: field.placeholder ?? undefined,
            keyboardType: 'email-address',
            'aria-label': 'Enter email address',
            style: { width: widthMap[field.width ?? 'full'] },
          }}
        />
      );
    }

    case 'text': {
      if (field.hidden) return null;
      return (
        <TextInputField
          {...baseProps}
          inputProps={{
            placeholder: field.placeholder ?? undefined,
            keyboardType: 'default',
            'aria-label': field.placeholder ?? 'Enter text',
            style: { width: widthMap[field.width ?? 'full'] },
          }}
        />
      );
    }

    case 'textarea': {
      if (field.hidden) return null;
      return (
        <TextAreaField
          {...baseProps}
          textareaProps={{
            placeholder: field.placeholder ?? undefined,
            keyboardType: 'default',
            'aria-label': field.placeholder ?? 'Enter text',
            containerClassName: 'h-24',
            style: { width: widthMap[field.width ?? 'full'] },
          }}
        />
      );
    }

    case 'select': {
      if (field.hidden) return null;
      return (
        <SelectInputField
          {...baseProps}
          items={field.options}
          transformItem={({ id: _, ...item }) => item}
          triggerInputProps={{
            placeholder: field.placeholder ?? 'Select an option',
            'aria-label': field.placeholder ?? 'Select an option',
          }}
          selectProps={{
            dynamicOption: field.withDynamicOption
              ? {
                  optionLabel: field.dynamicOptionLabel ?? 'Other',
                  optionPlaceholder: field.dynamicOptionPlaceholder ?? 'Please specify',
                }
              : undefined,
          }}
        />
      );
    }

    case 'multi-select': {
      if (field.hidden) return null;
      return (
        <SelectInputField
          {...baseProps}
          items={field.options}
          transformItem={({ id: _, ...item }) => item}
          helperText={baseProps.helperText ?? 'You can select multiple options'}
          triggerInputProps={{
            placeholder: field.placeholder ?? 'Select an option',
            'aria-label': field.placeholder ?? 'Select an option',
          }}
          selectProps={{
            isMultiSelect: true,
            dynamicOption: field.withDynamicOption
              ? {
                  optionLabel: field.dynamicOptionLabel ?? 'Other',
                  optionPlaceholder: field.dynamicOptionPlaceholder ?? 'Please specify',
                }
              : undefined,
          }}
        />
      );
    }

    case 'checkbox': {
      if (field.hidden) return null;
      return <CheckboxField {...baseProps} style={{ width: widthMap[field.width ?? 'full'] }} />;
    }

    case 'radio': {
      if (field.hidden) return null;
      return (
        <RadioGroupField
          {...baseProps}
          options={field.options}
          transformOption={({ id: _, ...item }) => item}
          radioGroupProps={{ orientation: 'horizontal' }}
        />
      );
    }

    case 'date': {
      if (field.hidden) return null;
      return (
        <DateInputField
          {...baseProps}
          datePickerProps={{
            showSetNowButton: false,
            style: { width: widthMap[field.width ?? 'full'] },
          }}
        />
      );
    }

    case 'number': {
      if (field.hidden) return null;
      return (
        <NumberInputField
          {...baseProps}
          inputProps={{
            placeholder: field.placeholder ?? undefined,
            'aria-label': field.placeholder ?? 'Enter number',
            containerStyle: { width: widthMap[field.width ?? 'full'] },
          }}
        />
      );
    }

    default:
      return null;
  }
}
