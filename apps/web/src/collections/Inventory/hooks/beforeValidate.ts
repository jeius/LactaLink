import { InventoryHookContext } from '@/lib/constants/hookContexts';
import { getEarliestExpiryDateOfBags } from '@/lib/utils/collections/getEarliestExpiryDateOfBags';
import { hookLogger, setHookContext } from '@lactalink/agents/payload';
import { Inventory } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { CollectionBeforeValidateHook, RequestContext } from 'payload';
import { getMilkBagsFromSourceDonation } from '../helpers';

/**
 * Before validate hook for the Inventory collection. This hook runs before
 * the data is validated and saved to the database.
 *
 * @description
 * This hook performs the following operations on create:
 * - Initializes the status to `AVAILABLE` if not provided.
 * - Retrieves the source donation and associated milk bags to calculate
 *   total volume and earliest expiry.
 * - Stores the associated milk bag IDs in the request context for use in
 *   the `afterChange` hook to link the bags to the inventory entry.
 */
export const beforeValidate: CollectionBeforeValidateHook<Inventory> = async ({
  data,
  operation,
  req,
  collection,
}) => {
  // Only proceed if there is data to validate
  if (!data) return data;

  const logger = hookLogger(req, collection.slug, 'beforeValidate');

  try {
    if (operation === 'create') {
      // Initialize status to 'AVAILABLE' if not provided
      if (!data.status) data.status = 'AVAILABLE';

      // Initialize volume fields to 0 by default, but preserve provided values if they exist
      if (!data.initialVolume) data.initialVolume = 0;
      if (!data.remainingVolume) data.remainingVolume = 0;

      if (!data.sourceDonation) return data;

      const bags = await getMilkBagsFromSourceDonation(data.sourceDonation, req, logger);
      if (!bags) return data;

      const totalVolume = bags.reduce((sum, bag) => sum + (bag.volume || 0), 0);
      data.initialVolume = data.initialVolume || totalVolume;
      data.remainingVolume = data.remainingVolume || totalVolume;

      // Set the inventory's expiresAt to the earliest expiry date among the linked bags
      const earliestExpiry = getEarliestExpiryDateOfBags(bags);
      if (earliestExpiry) {
        data.expiresAt = earliestExpiry.toISOString();
      }

      // Store milk bags in the request context for use in afterChange hook
      setHookContext<RequestContext['milkbags']>(req, InventoryHookContext.MilkBags, bags);

      logger.info(`Initialized inventory with ${bags.length} milk bags totaling ${totalVolume}ml`);
    }

    return data;
  } catch (error) {
    logger.error(error, `Failed to validate inventory: ${extractErrorMessage(error)}`);
    return data;
  }
};
