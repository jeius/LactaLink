import { Field } from 'payload';

export const createdByField: Field = {
  name: 'createdBy',
  type: 'relationship',
  relationTo: ['users'],
  admin: {
    position: 'sidebar',
  },
};
