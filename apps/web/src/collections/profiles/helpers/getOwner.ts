import {
  getHookContext,
  hookLogger,
  isHookRun,
  markHookRun,
  setHookContext,
} from '@lactalink/agents/payload';
import { User } from '@lactalink/types/payload-generated-types';
import { CollectionSlug, PayloadRequest } from 'payload';

const hookName = 'skipGetOwner';
const logCounterHookName = 'logCounter';

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
  const logCounter = getHookContext<number>(req, logCounterHookName) ?? 0;

  // Only log once per request
  if (logCounter < 1) {
    logger?.info(`Getting owner doc for document ID ${docID}`);
    setHookContext(req, logCounterHookName, logCounter + 1);
  }

  if (isHookRun(req, hookName)) return null;
  markHookRun(req, hookName);

  const { docs: users } = await req.payload.find({
    collection: 'users',
    limit: 1,
    pagination: false,
    req,
    depth: 0,
    where: {
      and: [{ 'profile.value': { equals: docID } }, { 'profile.relationTo': { equals: docSlug } }],
    },

    /**
     * IMPORTANT: Don't ever populate the owner field here, as it can cause infinite recursion
     * in the afterRead hook!
     */
    // populate: {
    //   individuals: {
    //     avatar: true,
    //     createdAt: true,
    //     updatedAt: true,
    //     birth: true,
    //     defaultAddress: true,
    //     dependents: true,
    //     displayName: true,
    //     familyName: true,
    //     givenName: true,
    //     gender: true,
    //     isVerified: true,
    //     maritalStatus: true,
    //     middleName: true,
    //     phone: true,
    //   },
    //   hospitals: {
    //     avatar: true,
    //     createdAt: true,
    //     updatedAt: true,
    //     defaultAddress: true,
    //     displayName: true,
    //     phone: true,
    //     posts: true,
    //     description: true,
    //     name: true,
    //     head: true,
    //     hospitalID: true,
    //     inventory: true,
    //     milkBags: true,
    //     type: true,
    //   },
    //   milkBanks: {
    //     avatar: true,
    //     createdAt: true,
    //     updatedAt: true,
    //     defaultAddress: true,
    //     displayName: true,
    //     phone: true,
    //     posts: true,
    //     description: true,
    //     name: true,
    //     head: true,
    //     inventory: true,
    //     milkBags: true,
    //     type: true,
    //   },
    // },
  });

  return users.length > 0 ? (users[0] as User) : null;
}
