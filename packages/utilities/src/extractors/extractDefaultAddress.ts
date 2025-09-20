import { Address, User } from '@lactalink/types/payload-generated-types';
import { extractCollection } from './extractCollection';

/**
 * Extracts the default address from a User object.
 * @param user - The User object containing addresses.
 * @returns The default Address object or null if not found.
 */
export function extractDefaultAddress<T extends Pick<User, 'addresses'> | null | undefined>(
  user: T
): T extends Pick<User, 'addresses'> ? Address | null : T {
  if (!user?.addresses?.docs || user.addresses.docs.length === 0) {
    return null as T extends Pick<User, 'addresses'> ? Address | null : T;
  }

  const addresses = extractCollection(user.addresses.docs);
  const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
  return defaultAddress as T extends Pick<User, 'addresses'> ? Address | null : T;
}
