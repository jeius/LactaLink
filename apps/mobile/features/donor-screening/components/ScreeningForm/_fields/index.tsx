import { CheckboxField } from '@/components/form-fields/CheckboxField';
import { DateInputField } from '@/components/form-fields/DateInputField';
import { NumberInputField } from '@/components/form-fields/NumberInputField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { BaseFieldProps } from '@/components/form-fields/types';
import { VStack } from '@/components/ui/vstack';
import { WIDTH_OPTIONS } from '@lactalink/enums';
import { useWatch, type Control } from 'react-hook-form';
import { BlockSchema } from '../../../lib/types';

interface FieldProps<T extends BlockSchema> {
  control: Control<T>;
  className?: BaseFieldProps<T>['className'];
  style?: BaseFieldProps<T>['style'];
}

export function NameField<T extends BlockSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <TextInputField
      {...props}
      control={control as unknown as Control<BlockSchema>}
      name="name"
      label="Name"
      inputProps={{ placeholder: 'Enter the name of the field' }}
      helperText="Short identifier for the field,"
      isRequired
    />
  );
}

export function LabelField<T extends BlockSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <TextAreaField
      {...props}
      control={control as unknown as Control<BlockSchema>}
      name="label"
      label="Label"
      textareaProps={{
        placeholder: 'e.g. Full Name, When is your birthday?',
        className: 'h-32',
      }}
      helperText="The question or prompt that will be shown to users when filling out the form."
      isRequired
    />
  );
}

export function PlaceholderField<T extends BlockSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <TextInputField
      {...props}
      control={control as unknown as Control<BlockSchema>}
      name="placeholder"
      label="Placeholder"
      inputProps={{ placeholder: 'e.g. Please select your birthdate' }}
      helperText="A hint that will be shown inside the field when it's empty to provide additional guidance to users on what to enter."
    />
  );
}

export function HelperTextField<T extends BlockSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <TextAreaField
      {...props}
      control={control as unknown as Control<BlockSchema>}
      name="helperText"
      label="Helper Text"
      textareaProps={{
        placeholder: 'e.g. By specifying your preferences, this will allow us to ...',
        className: 'h-32',
      }}
      helperText="Additional text that will be shown below the field to provide more context or instructions to users when filling out the form."
    />
  );
}

export function DefaultValueField<T extends BlockSchema>({
  control,
  valueType,
  ...props
}: FieldProps<T> & { valueType: 'text' | 'email' | 'date' | 'boolean' | 'number' }) {
  const baseProps: BaseFieldProps<BlockSchema> = {
    ...props,
    control: control as unknown as Control<BlockSchema>,
    name: 'defaultValue',
    label: 'Default Value',
    helperText: 'The value that will be pre-filled in the field when the form is first loaded.',
  };

  switch (valueType) {
    case 'boolean':
      return <CheckboxField {...baseProps} label="Default Checked?" />;
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

export function RequiredField<T extends BlockSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <CheckboxField
      {...props}
      control={control as unknown as Control<BlockSchema>}
      name="required"
      label="Required"
      helperText="Whether users are required to fill out this field when submitting the form."
    />
  );
}

export function HiddenField<T extends BlockSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <CheckboxField
      {...props}
      control={control as unknown as Control<BlockSchema>}
      name="hidden"
      label="Hidden"
      helperText="Whether this field should be hidden from users when filling out the form."
    />
  );
}

export function WidthField<T extends BlockSchema>({ control, ...props }: FieldProps<T>) {
  return (
    <SelectInputField
      {...props}
      control={control as unknown as Control<BlockSchema>}
      name="width"
      label="Width"
      helperText="The width of the field when displayed in the form."
      items={Object.values(WIDTH_OPTIONS)}
      transformItem={(item) => item}
      selectProps={{ showSelectedIcon: true }}
    />
  );
}

export function DynamicOptionField<T extends BlockSchema>({ control, ...props }: FieldProps<T>) {
  const withDynamicOptions = useWatch({
    control: control as unknown as Control<BlockSchema>,
    name: 'withDynamicOption',
  });

  return (
    <VStack {...props} space="md">
      <CheckboxField
        control={control as unknown as Control<BlockSchema>}
        name="withDynamicOption"
        label="With Dynamic Option"
        helperText="If checked, adds an option that the user can specify."
      />

      {withDynamicOptions && (
        <>
          <TextInputField
            control={control as unknown as Control<BlockSchema>}
            name="dynamicOptionLabel"
            label="Dynamic Option Label"
            inputProps={{ placeholder: 'e.g. Other' }}
            helperText="The label for the dynamic option that allows users to specify their own answer."
          />

          <TextInputField
            control={control as unknown as Control<BlockSchema>}
            name="dynamicOptionPlaceholder"
            label="Dynamic Option Placeholder"
            inputProps={{ placeholder: 'e.g. Please specify...' }}
            helperText="The placeholder for the input that appears when users select the dynamic option to specify their own answer."
          />
        </>
      )}
    </VStack>
  );
}
