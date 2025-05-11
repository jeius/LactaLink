import { Field } from 'payload';

export const ownerField: Field = {
  name: 'owner',
  type: 'relationship',
  relationTo: 'users',
  admin: {
    position: 'sidebar',
  },
};
