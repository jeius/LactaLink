import type { CollectionSlug } from 'payload';

export type ProfileSlug = Extract<CollectionSlug, 'individuals' | 'hospitals' | 'milkBanks'>;

export function getProfileReference(value: unknown): {
  relationTo: ProfileSlug;
  id: string | number | undefined;
} {
  if (value && typeof value === 'object' && 'relationTo' in value && 'value' in value) {
    const relationship = value as { relationTo: ProfileSlug; value: unknown };
    return { relationTo: relationship.relationTo, id: getID(relationship.value) };
  }

  return { relationTo: 'individuals', id: getID(value) };
}

function getID(value: unknown): string | number | undefined {
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === 'string' || typeof id === 'number' ? id : undefined;
  }
  return undefined;
}
