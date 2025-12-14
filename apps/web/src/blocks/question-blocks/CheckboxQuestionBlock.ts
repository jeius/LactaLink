import { Block } from 'payload';
import { baseFields, layoutField, optionsField } from './_fields';

export const CheckboxQuestionBlock: Block = {
  slug: 'checkbox-question',
  labels: {
    singular: 'Multiple Answer Question',
    plural: 'Multiple Answer Questions',
  },
  fields: [
    ...baseFields,

    layoutField,

    optionsField,

    {
      name: 'validation',
      type: 'group',
      label: 'Validation Rules',
      admin: {
        description: 'Optional validation constraints',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'minSelections',
              label: 'Minimum Number of Selections',
              type: 'number',
              admin: {
                description: 'Minimum number of selections. Leave blank for no minimum.',
                width: '50%',
              },
            },
            {
              name: 'maxSelections',
              label: 'Maximum Number of Selections',
              type: 'number',
              admin: {
                description: 'Maximum number of selections allowed. Leave blank for no limit.',
                width: '50%',
              },
            },
          ],
        },
      ],
    },
  ],
};
