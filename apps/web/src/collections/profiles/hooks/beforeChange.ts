import { hookLogger } from '@lactalink/agents/payload';
import { Hospital, Individual, MilkBank } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook, PayloadRequest } from 'payload';

/**
 * Before change hook for profiles collections (Individuals, Hospitals, MilkBanks).
 * - If a file is included in the request, it will upsert the avatar image for the profile.
 */
export const beforeChange: CollectionBeforeChangeHook<Individual | Hospital | MilkBank> = async ({
  data,
  originalDoc,
  req,
  collection,
}) => {
  const logger = hookLogger(req, collection.slug, 'beforeChange');

  const avatarID = extractID(originalDoc?.avatar) ?? extractID(data.avatar);
  const upsertedAvatar = await upsertAvatar(req, avatarID, logger);
  if (upsertedAvatar) {
    data.avatar = upsertedAvatar.id;
    logger.info('Upserted avatar image', { avatarID: upsertedAvatar.id });
  }

  return data;
};

/**
 * Upserts an avatar image for a profile.
 * If an avatarID is provided, it updates the existing avatar;
 * otherwise, it creates a new one.
 */
async function upsertAvatar(
  req: PayloadRequest,
  avatarID?: string | null,
  logger?: ReturnType<typeof hookLogger>
) {
  const file = req.file;
  if (!file) {
    logger?.info('No file provided for avatar upsert, skipping...');
    return null;
  }

  if (avatarID) {
    logger?.info('Updating existing avatar', { avatarID });
    return req.payload.update({
      collection: 'avatars',
      id: avatarID,
      data: {},
      file: file,
      req,
    });
  }

  logger?.info('Creating new avatar...');

  return req.payload.create({
    collection: 'avatars',
    data: {},
    file: file,
    req,
  });
}
