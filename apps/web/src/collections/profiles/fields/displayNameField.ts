import { NullableValidator } from '@lactalink/agents/payload';
import { Hospital, Individual, MilkBank } from '@lactalink/types/payload-generated-types';
import { capitalizeAll } from '@lactalink/utilities/formatters';
import { FieldHook, TextField } from 'payload';

/**
 * Factory function to create a standardized displayName field for profile collections.
 * This field automatically generates a display name for hospitals, milk banks, and individuals.
 *
 * @param overrides - Partial field configuration to override defaults.
 * @returns A TextField configuration for the displayName field with hooks and validation.
 *
 * @default
 * ```ts
 * {
 *   name: 'displayName',
 *   label: 'Display Name',
 *   type: 'text',
 *   admin: { position: 'sidebar' },
 * }
 * ```
 */
export function displayNameField(overrides: Partial<TextField>): TextField {
  //@ts-expect-error - Payload's Field types issue. Safe to ignore.
  return {
    name: 'displayName',
    label: 'Display Name',
    type: 'text',
    hasMany: false,
    validate: NullableValidator.text,
    hooks: { beforeChange: [generateDisplayName] },
    ...overrides,
    admin: {
      position: 'sidebar',
      ...overrides.admin,
    },
  };
}

/**
 * Field hook to generate a display name based on the type of profile:
 * - For hospitals and milk banks, it uses the 'name' field.
 * - For individuals, it combines 'givenName' and 'familyName', optionally including a middle initial.
 */
const generateDisplayName: FieldHook<
  Individual | Hospital | MilkBank,
  string,
  Individual | Hospital | MilkBank
> = async ({ data, value }) => {
  let displayName = value || '';

  const sanitizeName = (name: string) => capitalizeAll(name.trim());

  if (!data) return displayName;

  // For hospitals and milk banks, use the 'name' field to generate displayName.
  // For individuals, use givenName and familyName.
  if ('name' in data && data.name) {
    const sanitizedName = sanitizeName(data.name);
    data.displayName = sanitizedName;
  } else if ('givenName' in data || 'familyName' in data) {
    const { givenName, middleName, familyName } = data;

    if (!givenName || !familyName) return displayName;

    const sanitizedGivenName = sanitizeName(givenName);
    const sanitizedFamilyName = sanitizeName(familyName);

    displayName = `${sanitizedGivenName} ${sanitizedFamilyName}`;

    if (middleName) {
      const middleInitial = `${middleName[0]}.`;
      displayName = `${sanitizedGivenName} ${middleInitial} ${sanitizedFamilyName}`;
    }
  }

  return displayName;
};
