import { WIDTH_OPTIONS } from '@lactalink/enums';
import type { Field } from 'payload';

const name: Field = {
  name: 'name',
  label: 'Name',
  type: 'text',
  required: true,
  admin: {
    width: '50%',
    description: 'Unique identifier for this question and must be camelCase (e.g., "emailAddress")',
  },
};

const label: Field = {
  name: 'label',
  label: 'Label',
  type: 'text',
  required: true,
  admin: {
    width: '50%',
    description: 'The text that users will see',
  },
};

const required: Field = {
  name: 'required',
  label: 'Required',
  type: 'checkbox',
  admin: {
    width: '50%',
    description: 'Whether this field must be filled out',
  },
};

const placeholder: Field = {
  name: 'placeholder',
  label: 'Placeholder',
  type: 'text',
  admin: {
    width: '50%',
    description: 'Example text shown inside the field before user input (e.g., "Enter your email")',
  },
};

const helperText: Field = {
  name: 'helperText',
  label: 'Helper Text',
  type: 'text',
  admin: {
    width: '50%',
    description:
      'Additional guidance shown below the field (e.g., "We will never share your email.")',
  },
};

const defaultValue: Field = {
  name: 'defaultValue',
  label: 'Default Value',
  type: 'text',
  admin: {
    width: '50%',
    description: 'Pre-filled value for this field',
  },
};

const width: Field = {
  name: 'width',
  label: 'Field Width',
  type: 'select',
  defaultValue: WIDTH_OPTIONS.full.value,
  enumName: 'enum_field_width',
  interfaceName: 'FieldWidth',
  options: Object.values(WIDTH_OPTIONS),
  admin: {
    width: '50%',
    description: 'Width of the field in the form layout.',
  },
};

const hidden: Field = {
  name: 'hidden',
  label: 'Hidden Field?',
  type: 'checkbox',
  admin: {
    width: '50%',
    description: 'If checked, this field will not be visible to users filling out the form.',
  },
};

const options: Field = {
  name: 'options',
  label: 'Options',
  type: 'array',
  required: true,
  fields: [
    { name: 'value', label: 'Option Value', type: 'text', required: true, admin: { width: '50%' } },
    { name: 'label', label: 'Option Label', type: 'text', required: true, admin: { width: '50%' } },
  ],
  admin: {
    description: 'The options available for select, multi-select, or radio fields.',
  },
};

const dynamicOption: Field[] = [
  {
    name: 'withDynamicOption',
    label: 'With Dynamic Option?',
    type: 'checkbox',
    admin: {
      description: 'If checked, a user-defined option will be added to the options.',
    },
  },
  {
    type: 'row',
    admin: { condition: (_, siblingData) => !!siblingData?.withDynamicOption },
    fields: [
      {
        name: 'dynamicOptionLabel',
        label: 'Label',
        type: 'text',
        defaultValue: 'Other',
        admin: {
          width: '50%',
          description: 'The label for the user-defined option (e.g., "Other")',
        },
      },
      {
        name: 'dynamicOptionPlaceholder',
        label: 'Placeholder',
        type: 'text',
        defaultValue: 'Please specify',
        admin: {
          width: '50%',
          description: 'The placeholder for the user-defined option input (e.g., "Please specify")',
        },
      },
    ],
  },
];

export {
  defaultValue,
  dynamicOption,
  helperText,
  hidden,
  label,
  name,
  options,
  placeholder,
  required,
  width,
};
