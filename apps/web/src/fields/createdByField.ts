import { Field } from 'payload';

export const createdByField: Field = {
  name: 'createdBy',
  type: 'relationship',
  relationTo: 'users',
  admin: {
    position: 'sidebar',
    readOnly: true,
  },
};

export const createdByProfileField: Field = {
  name: 'createdBy',
  type: 'relationship',
  relationTo: ['individuals', 'milkBanks', 'hospitals'],
  required: true,
  hasMany: false,
  validate: () => true, // Validation handled in generateCreatedBy hook
  admin: {
    position: 'sidebar',
    readOnly: true,
  },
};
