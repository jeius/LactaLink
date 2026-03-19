import { hookLogger } from '@lactalink/agents/payload';
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
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
): Promise<User | null> {
  logger?.info(`Getting owner doc for document ID ${docID}`);

  const { docs: users } = await req.payload.find({
    collection: 'users',
    limit: 1,
    pagination: false,
    depth: 0,
    req,
    where: {
      and: [{ 'profile.value': { equals: docID } }, { 'profile.relationTo': { equals: docSlug } }],
    },
  });

  return users.length > 0 ? users[0]! : null;
}
