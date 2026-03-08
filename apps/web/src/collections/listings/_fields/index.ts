import { NullableValidator } from '@lactalink/agents/payload';
import { Field, PolymorphicRelationshipField, TextField } from 'payload';
import { generateTitle } from '../_hooks/generateTitle';

/**
 * Defines a reusable recipient field for both `Donations` and `Requests` collections.
 *
 * @param adminOverrides - Overrides for the admin configuration of the field.
 * @returns A configured PolymorphicRelationshipField for recipient with appropriate admin settings.
 */
export function recipientField(
  adminOverrides: PolymorphicRelationshipField['admin']
): PolymorphicRelationshipField {
  return {
    name: 'recipient',
    label: 'Recipient',
    type: 'relationship',
    relationTo: ['individuals', 'hospitals', 'milkBanks'],
    hasMany: false,
    admin: {
      width: '50%',
      ...adminOverrides,
    },
  };
}

/**
 * Defines a reusable timestamp fields for both `Donations` and `Requests` collections.
 */
export function timeStampFields(): Field[] {
  const fieldNames = ['completedAt', 'cancelledAt', 'rejectedAt', 'expiredAt'];
  return fieldNames.map((fieldName) => ({
    name: fieldName,
    type: 'date',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
  }));
}

/**
 * Defines a reusable title field for both `Donations` and `Requests` collections,
 * which is auto-generated based on the donor/requester and volumes.
 */
export function titleField(adminOverrides: TextField['admin']): TextField {
  return {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    validate: NullableValidator.text,
    hooks: { beforeChange: [generateTitle] },
    admin: {
      readOnly: true,
      position: 'sidebar',
      ...adminOverrides,
    },
  };
}
