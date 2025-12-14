import { Block } from 'payload';
import { baseFields, layoutField, optionsField } from './_fields';

export const RadioQuestionBlock: Block = {
  slug: 'radio-question',
  labels: {
    singular: 'Single Answer Question',
    plural: 'Single Answer Questions',
  },
  fields: [...baseFields, { ...optionsField, minRows: 2 }, layoutField],
};
