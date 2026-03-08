import { hookLogger } from '@lactalink/agents/payload';
import { Request } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { CollectionBeforeValidateHook } from 'payload';
import { syncVolumes } from '../../_helpers';

/**
 * Before validate hook for `Requests` collection.
 * @description
 * This hook runs before the data is validated and saved to the database.
 * - It initializes volume fields
 * - Calculates volumes based on associated milk bags.
 */
export const beforeValidate: CollectionBeforeValidateHook<Request> = async ({
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
      if (!data.volumeFulfilled) data.volumeFulfilled = 0;
      if (!data.volumeNeeded) data.volumeNeeded = 20;
      if (!data.initialVolumeNeeded) data.initialVolumeNeeded = 20;
    }

    /** Update operations */
    if (operation === 'update') {
      // Update operation hooks here
    }

    /**
     * This must run on both operations to ensure volumes are always accurate if bags are
     * modified
     */
    await syncVolumes(data, req).then(logInfo);
  } catch (err) {
    logger.error(err, `Failed to validate request data: ${extractErrorMessage(err)}`);
  }

  return data;
};
