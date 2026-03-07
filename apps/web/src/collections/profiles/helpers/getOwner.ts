import { User } from '@lactalink/types/payload-generated-types';
import { CollectionSlug, PayloadRequest } from 'payload';

/**
 * Helper function to find the owner of a profile document by querying the users collection.
 *
 * @param docID - The ID of the profile document whose owner we want to find.
 * @param docSlug - The slug of the profile collection (e.g. 'individuals', 'hospitals', 'milkBanks').
 * @param req - The Payload request object, used to perform the query operation.
 * @return The `User` document of the owner if found, or null if no owner is found.
 */
export async function getOwner(
  docID: string,
  docSlug: CollectionSlug,
  req: PayloadRequest
): Promise<User | null> {
  const depth = req.searchParams.get('depth');

  const { docs: users } = await req.payload.find({
    collection: 'users',
    limit: 1,
    pagination: false,
    req,
    depth: depth ? parseInt(depth) : req.payload.config.defaultDepth,
    where: {
      and: [{ 'profile.value': { equals: docID } }, { 'profile.relationTo': { equals: docSlug } }],
    },
    /**
     * Only select necessary fields to minimize data transfer, since we only need the
     * user ID and maybe email for admin UI display.
     *
     * IMPORTANT: Don't ever select the profile field here, as it can cause infinite recursion
     * in the afterRead hook!
     */
    select: {
      email: true,
      phone: true,
      addresses: true,
      deliveryPreferences: true,
      onlineAt: true,
      lastSignInAt: true,
      picture: true,
    },
  });

  return users.length > 0 ? (users[0] as User) : null;
}
