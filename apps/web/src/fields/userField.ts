import { extractID } from '@lactalink/utilities/extractors';
import { RelationshipField } from 'payload';

type Overrides = Partial<
  Pick<RelationshipField, 'name' | 'required' | 'label' | 'index' | 'unique' | 'access'>
>;

const userField: RelationshipField = {
  name: 'user',
  type: 'relationship',
  relationTo: 'users',
  hasMany: false,
  validate: () => true, // No need to validate since it's auto-set
  hooks: {
    beforeChange: [
      ({ value, req, operation }) => {
        if (operation !== 'create' || !req.user) return value;
        if (value && value !== '') return value; // Preserve existing value if present
        return extractID(req.user);
      },
    ],
  },
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: 'The user who created this entry. (Automatic, safe to ignore)',
  },
};

const userProfileField: RelationshipField = {
  name: 'user',
  type: 'relationship',
  relationTo: ['individuals', 'milkBanks', 'hospitals'],
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
    description: 'The profile of the user who created this entry. (Automatic, safe to ignore)',
  },
};

/**
 * Create a `User` relationship field with optional overrides.
 * Value is auto-set to the current user on create
 * therefore, validation is bypassed.
 * @param overrides `RelationshipField` overrides
 * @returns `RelationshipField`
 */
export function createUserField(overrides: Overrides = {}): RelationshipField {
  return { ...userField, ...overrides };
}

/**
 * Create a `UserProfile` polymorphic-relationship field with optional overrides.
 * Value is auto-set to the current `UserProfile` on create
 * therefore, validation is bypassed.
 * @param overrides `RelationshipField` overrides
 * @returns `RelationshipField`
 */
export function createUserProfileField(overrides: Overrides = {}): RelationshipField {
  return { ...userProfileField, ...overrides };
}
