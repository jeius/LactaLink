import { Field } from 'payload';

export const seenTrackingFields: Field[] = [
  {
    name: 'seen',
    type: 'checkbox',
    defaultValue: false,
    required: false,
    admin: {
      position: 'sidebar',
      readOnly: true,
      description: 'Indicates whether the collection has been seen by the user',
    },
  },
  {
    name: 'seenAt',
    type: 'date',
    required: false,
    admin: {
      position: 'sidebar',
      readOnly: true,
      description: 'The timestamp when the collection was last seen by the user',
    },
  },
];
