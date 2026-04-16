import { CheckboxField } from '@/components/form-fields/CheckboxField';
import { DateInputField } from '@/components/form-fields/DateInputField';
import { NumberInputField } from '@/components/form-fields/NumberInputField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { BaseFieldProps } from '@/components/form-fields/types';
import { VStack } from '@/components/ui/vstack';
import { WIDTH_OPTIONS } from '@lactalink/enums';
import { DonorScreeningFormField } from '@lactalink/types/collections';
import { type Control } from 'react-hook-form';

export { OptionsField } from './OptionsField';

type FieldSchema = Exclude<DonorScreeningFormField, { blockType: 'message' }>;

interface FieldProps<T extends FieldSchema> {
  control: Control<T>;
  className?: BaseFieldProps<T>['className'];
  style?: BaseFieldProps<T>['style'];
}

export function NameField<T extends FieldSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <TextInputField
      {...props}
      control={control as unknown as Control<FieldSchema>}
      name="name"
      label="Name"
      inputProps={{ placeholder: 'Enter the name of the field' }}
      helperText="Short identifier for the field,"
      isRequired
    />
  );
}

export function LabelField<T extends FieldSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <TextAreaField
      {...props}
      control={control as unknown as Control<FieldSchema>}
      name="label"
      label="Label"
      textareaProps={{ placeholder: 'Enter the name of the field', className: 'h-32' }}
      helperText="The text that will be shown to users when filling out this field. (e.g. First Name, Last Name, Email Address)"
      isRequired
    />
  );
}

export function PlaceholderField<T extends FieldSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <TextInputField
      {...props}
      control={control as unknown as Control<FieldSchema>}
      name="placeholder"
      label="Placeholder"
      inputProps={{ placeholder: 'Enter the placeholder text' }}
      helperText="The text that will be shown inside the field when it is empty."
    />
  );
}

export function HelperTextField<T extends FieldSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <TextAreaField
      {...props}
      control={control as unknown as Control<FieldSchema>}
      name="helperText"
      label="Helper Text"
      textareaProps={{ placeholder: 'Enter the helper text', className: 'h-32' }}
      helperText="The text that will be shown below the field to provide additional information to users."
    />
  );
}

export function DefaultValueField<T extends FieldSchema>({
  control,
  valueType,
  ...props
}: FieldProps<T> & { valueType: 'text' | 'email' | 'date' | 'boolean' | 'number' }) {
  const baseProps: BaseFieldProps<FieldSchema> = {
    ...props,
    control: control as unknown as Control<FieldSchema>,
    name: 'defaultValue',
    label: 'Default Value',
    helperText: 'The value that will be pre-filled in the field when the form is first loaded.',
  };

  switch (valueType) {
    case 'boolean':
      return <CheckboxField {...baseProps} />;
    case 'date':
      return (
        <DateInputField {...baseProps} datePickerProps={{ placeholder: 'Select a default date' }} />
      );
    case 'number':
      return (
        <NumberInputField {...baseProps} inputProps={{ placeholder: 'Enter a default value' }} />
      );
    case 'email':
      return (
        <TextInputField
          {...baseProps}
          inputProps={{
            placeholder: 'Enter a default email address',
            keyboardType: 'email-address',
          }}
        />
      );

    default:
      return (
        <TextInputField {...baseProps} inputProps={{ placeholder: 'Enter a default value' }} />
      );
  }
}

export function RequiredField<T extends FieldSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <CheckboxField
      {...props}
      control={control as unknown as Control<FieldSchema>}
      name="required"
      label="Required"
      helperText="Whether users must fill out this field before submitting the form."
    />
  );
}

export function HiddenField<T extends FieldSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <CheckboxField
      {...props}
      control={control as unknown as Control<FieldSchema>}
      name="hidden"
      label="Hidden"
      helperText="Whether this field should be hidden from users when filling out the form."
    />
  );
}

export function WidthField<T extends FieldSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <SelectInputField
      {...props}
      control={control as unknown as Control<FieldSchema>}
      name="width"
      label="Width"
      items={Object.values(WIDTH_OPTIONS)}
      transformItem={(item) => item}
      selectProps={{ showSelectedIcon: true }}
    />
  );
}

export function DynamicOptionField<T extends FieldSchema>({
  control,
  isChecked,
  ...props
}: FieldProps<T> & {
  isChecked: boolean;
}) {
  return (
    <VStack {...props} space="md">
      <CheckboxField
        control={control as unknown as Control<FieldSchema>}
        name="withDynamicOption"
        label="With Dynamic Option"
        helperText="If checked, adds an option that the user can specify."
      />

      {isChecked && (
        <>
          <TextInputField
            control={control as unknown as Control<FieldSchema>}
            name="dynamicOptionLabel"
            label="Dynamic Option Label"
            inputProps={{ placeholder: 'Enter the label for the dynamic option' }}
            helperText="The label for the dynamic option that will be shown to users when filling out the form."
          />

          <TextInputField
            control={control as unknown as Control<FieldSchema>}
            name="dynamicOptionPlaceholder"
            label="Dynamic Option Placeholder"
            inputProps={{ placeholder: 'Enter the placeholder for the dynamic option' }}
            helperText="The placeholder for the dynamic option that will be shown to users when filling out the form."
          />
        </>
      )}
    </VStack>
  );
}
