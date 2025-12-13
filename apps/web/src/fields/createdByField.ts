import { extractID } from '@lactalink/utilities/extractors';
import { RelationshipField } from 'payload';

export const createdByField: RelationshipField = {
  name: 'createdBy',
  type: 'relationship',
  relationTo: 'users',
  hasMany: false,
  validate: () => true, // No need to validate, as it's auto-generated
  hooks: {
    beforeChange: [
      ({ value, req }) => {
        if (!req.user) return value;
        if (value && value !== '') return value; // Preserve existing value if present
        return extractID(req.user);
      },
    ],
  },
  admin: {
    position: 'sidebar',
    readOnly: true,
  },
};

export const createdByProfileField: RelationshipField = {
  name: 'createdBy',
  type: 'relationship',
  relationTo: ['individuals', 'milkBanks', 'hospitals'],
  required: true,
  hasMany: false,
  validate: () => true, // Validation handled in generateCreatedBy hook
  hooks: {
    beforeChange: [
      ({ value, req }) => {
        if (!req.user || !req.user.profile) return value;
        if (value) return value; // Preserve existing value if present
        return {
          relationTo: req.user.profile.relationTo,
          value: extractID(req.user.profile.value),
        };
      },
    ],
  },
  admin: {
    position: 'sidebar',
    readOnly: true,
  },
};
