import { CHOICE_TYPE, ORIENTATION } from '@lactalink/enums';
import { ArrayField, Field, SelectField } from 'payload';

export const baseFields: Field[] = [
  {
    name: 'required',
    type: 'checkbox',
    label: 'Is this required?',
    defaultValue: true,
  },

  {
    name: 'question',
    label: 'Question',
    type: 'text',
    required: true,
  },

  {
    name: 'helpText',
    label: 'Helper Text',
    type: 'textarea',
    admin: {
      description: 'Optional helper text for clarification',
    },
  },
];

export const optionsField: ArrayField = {
  name: 'options',
  type: 'array',
  label: 'Answer Choices',
  labels: {
    singular: 'Choice',
    plural: 'Choices',
  },
  required: true,
  minRows: 1,
  admin: {
    description: 'Define the available choices',
  },
  fields: [
    {
      name: 'type',
      type: 'radio',
      label: 'Choice Type',
      enumName: 'enum_choice_type',
      required: true,
      options: Object.values(CHOICE_TYPE),
      defaultValue: CHOICE_TYPE.PREDEFINED.value,
      admin: {
        description: `Select whether this choice is predefined or a user-defined choice. 
                      For example, set to User Defined if the answer can be anything outside of the listed options.`,
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description:
          'The choice text displayed to users. e.g., "Banana", "Apple Mango", or "Other" if the type is User Defined',
      },
    },
    {
      name: 'value',
      type: 'text',
      required: true,
      admin: {
        condition: (_, { type }) => type === CHOICE_TYPE.PREDEFINED.value,
        description: 'The internal value for this option. e.g., "BANANA", "APPLE_MANGO"',
      },
    },
  ],
};

export const layoutField: SelectField = {
  name: 'layout',
  label: 'Choices Orientation',
  type: 'select',
  required: true,
  defaultValue: ORIENTATION.VERTICAL.value,
  enumName: 'enum_orientation',
  options: Object.values(ORIENTATION),
  admin: {
    description: 'How to display the choices',
  },
};
