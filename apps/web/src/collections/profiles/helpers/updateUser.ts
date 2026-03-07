import { getHookContext, hookLogger } from '@lactalink/agents/payload';
import { PROFILE_TYPES } from '@lactalink/enums';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest, RequestContext, SanitizedCollectionConfig } from 'payload';

type ProfileSlugs = Extract<CollectionSlug, 'individuals' | 'hospitals' | 'milkBanks'>;

const profileType: Record<ProfileSlugs, keyof typeof PROFILE_TYPES> = {
  individuals: PROFILE_TYPES.INDIVIDUAL.value,
  hospitals: PROFILE_TYPES.HOSPITAL.value,
  milkBanks: PROFILE_TYPES.MILK_BANK.value,
};

/**
 * Updates the user's profile reference and type based on the created or updated profile document.
 *
 * @description
 * This function is intended to be called from the `afterChange` hook of profile collections.
 *
 * @param profileID - The ID of the newly created or updated profile document.
 * @param collection - The collection configuration of the profile document.
 * @param req - The Payload request object, used to perform the update operation on the user document.
 * @param logger - Optional logger for logging the update process.
 *
 * @throws Will throw an error if the update operation fails.
 */
export async function updateUserProfile(
  profileID: string,
  collection: SanitizedCollectionConfig,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  if (!req.user) {
    logger?.warn('No authenticated user found in request, skipping user update');
    return;
  }

  const owner = getHookContext<RequestContext['user']>(req, 'owner');
  let ownerID = extractID(owner);

  if (!ownerID) {
    logger?.warn('No owner ID found in context, using authenticated user as fallback...');
    ownerID = extractID(req.user);
  }

  try {
    const depth = req.searchParams.get('depth');
    const updatedUser = await req.payload.update({
      req,
      collection: 'users',
      id: ownerID,
      depth: depth ? parseInt(depth) : req.payload.config.defaultDepth,
      data: {
        profileType: profileType[collection.slug as ProfileSlugs],
        profile: { relationTo: collection.slug as ProfileSlugs, value: profileID },
      },
    });

    logger?.info('User update successful for ID:', updatedUser.id);
    return updatedUser;
  } catch (error) {
    logger?.error(error, `Error updating user with ID: ${ownerID} for profile ID: ${profileID}`);
    throw error;
  }
}
