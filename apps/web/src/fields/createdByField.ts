import { extractID } from '@lactalink/utilities/extractors';
import { RelationshipField } from 'payload';

/**
 * @deprecated Use [createUserField](./userField.ts) instead
 */
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
