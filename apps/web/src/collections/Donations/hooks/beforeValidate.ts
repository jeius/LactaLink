import { hookLogger } from '@lactalink/agents/payload';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { CollectionBeforeValidateHook } from 'payload';
import { ensureVolumesSynced, updateStatusOnRecipientPresence } from '../helpers';

/**
 * Before validate hook for Donations collection.
 * @description
 * This hook runs before the data is validated and saved to the database.
 * - It initializes volume fields
 * - Sets status based on recipient presence,
 * - Calculates volumes based on associated milk bags.
 */
export const beforeValidate: CollectionBeforeValidateHook<Donation> = async ({
  data,
  req,
  operation,
  collection,
}) => {
  if (!data) return data;

  const logger = hookLogger(req, collection.slug, 'beforeValidate');
  const logInfo = (msg: string | null | undefined) => logger.info(msg || '');

  try {
    /** Create operations */
    if (operation === 'create') {
      // Initialize volume fields to minimum by default
      data.volume = 20;
      data.remainingVolume = 20;
    }

    /** Update operations */
    if (operation === 'update') {
      // Update operation hooks here
    }

    /**
     * This must run on both create and update to ensure status is always accurate
     * based on recipient field
     */
    data = updateStatusOnRecipientPresence(data);

    /**
     * This must run on both operations to ensure volumes are always accurate if bags are
     * modified
     */
    await ensureVolumesSynced(data, req).then(logInfo);
  } catch (err) {
    logger.error(err, `Failed to validate donation data: ${extractErrorMessage(err)}`);
  }

  return data;
};
