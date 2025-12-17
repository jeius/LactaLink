import { TEXT_BLOCK_ANSWER_LENGTH } from '@lactalink/enums';
import { Block } from 'payload';
import { baseFields } from './_fields';

export const TextQuestionBlock: Block = {
  slug: 'text-question',
  labels: {
    singular: 'Text Answer Question',
    plural: 'Text Answer Questions',
  },
  fields: [
    ...baseFields,

    {
      type: 'row',
      fields: [
        {
          name: 'expectedAnswerLength',
          label: 'Expected Answer Length',
          type: 'select',
          required: true,
          enumName: 'enum_text_answer_length',
          options: Object.values(TEXT_BLOCK_ANSWER_LENGTH),
          defaultValue: TEXT_BLOCK_ANSWER_LENGTH.SHORT.value,
          admin: {
            description: 'Indicate the expected length of the answer',
            width: '40%',
          },
        },

        {
          name: 'placeholder',
          type: 'text',
          admin: {
            description: 'Placeholder text for the input field',
            width: '60%',
          },
        },
      ],
    },

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
              name: 'minLength',
              type: 'number',
              admin: {
                description: 'Minimum character length. Leave blank for no minimum.',
                width: '50%',
              },
            },
            {
              name: 'maxLength',
              type: 'number',
              defaultValue: 500,
              admin: {
                description: 'Maximum character length. Leave blank for no maximum.',
                width: '50%',
              },
            },
          ],
        },
      ],
    },
  ],
};
