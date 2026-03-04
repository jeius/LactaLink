import { NullableValidator } from '@lactalink/agents/payload';
import { Hospital, MilkBank } from '@lactalink/types/payload-generated-types';
import { FieldHook, NumberField } from 'payload';

/**
 * Field hook to calculate and initialize the total volume of milk in stock for an organization (Hospital or Milk Bank).
 */
const initializeVolume: FieldHook<Hospital | MilkBank, number, Hospital | MilkBank> = async ({
  req,
  data,
  collection,
  operation,
  value,
}) => {
  if (!data || !collection?.slug || operation === 'update') return value ?? 0;

  const inventoryItems = await req.payload.find({
    collection: 'inventories',
    where: {
      and: [
        { 'organization.value': { equals: data.id } },
        { 'organization.relationTo': { equals: collection.slug } },
      ],
    },
    depth: 0,
    limit: 0, // Ensure we get all inventory items
    pagination: false,
    select: { remainingVolume: true },
  });

  return inventoryItems.docs.reduce((total, item) => {
    return total + (item.remainingVolume || 0);
  }, 0);
};

/**
 * Factory function to create a totalVolume field with the necessary configuration and hooks for both Hospitals and Milk Banks.
 * @param {Partial<NumberField>} overrides Optional overrides for the number field configuration.
 * @return {NumberField} Configured number field for total volume with hooks to initialize the value based on inventory.
 *
 * @default
 * ```ts
 * {
 *  name: 'totalVolume',
 *  label: 'Total Volume in Stock',
 *  type: 'number',
 *  defaultValue: 0,
 *  admin: { readOnly: true },
 * }
 * ```
 */
export function createOrgTotalVolumeField(overrides: Partial<NumberField>): NumberField {
  //@ts-expect-error - We know this is a number field, but the type is not being inferred correctly
  return {
    name: 'totalVolume',
    label: 'Total Volume in Stock',
    type: 'number',
    defaultValue: 0,
    validate: NullableValidator.number,
    hooks: { beforeValidate: [initializeVolume] },
    ...overrides,
    admin: {
      readOnly: true,
      ...overrides.admin,
    },
  };
}
