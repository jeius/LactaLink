import { extractID } from '@lactalink/utilities/extractors';
import { Field, RelationshipField } from 'payload';

export const createdByField: RelationshipField = {
  name: 'createdBy',
  type: 'relationship',
  relationTo: 'users',
  hasMany: false,
  validate: () => true, // No need to validate since it's auto-set
  hooks: {
    beforeChange: [
      ({ value, req, operation }) => {
        if (operation !== 'create' || !req.user) return value;
        if (value && value !== '') return value; // If createdBy is already set, do not override
        return extractID(req.user);
      },
    ],
  },
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
