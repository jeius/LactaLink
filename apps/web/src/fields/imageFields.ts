import { Field } from 'payload';

export const imageFields: Field[] = [
  {
    name: 'alt',
    type: 'text',
  },
  {
    name: 'blurHash',
    type: 'text',
    admin: {
      description: 'A string that represents a blurred version of the image.',
      position: 'sidebar',
      readOnly: true,
    },
  },
];
