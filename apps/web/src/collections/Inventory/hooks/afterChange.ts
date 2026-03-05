import { hookLogger } from '@lactalink/agents/payload';
import { Inventory } from '@lactalink/types/payload-generated-types';
import { CollectionAfterChangeHook } from 'payload';
import { linkMilkBagsToInventory } from '../helpers';

/**
 * After change hook for the Inventory collection. This hook is triggered after an inventory record is created or updated.
 *
 * @description
 * It performs the following operations:
 * - On creation, it links any associated milk bags to the inventory entry.
 * - On both creation and update, it queues a job to update the stock levels for the associated organization.
 */
export const afterChange: CollectionAfterChangeHook<Inventory> = async ({
  doc,
  operation,
  req,
  collection,
}) => {
  const logger = hookLogger(req, collection.slug, 'afterChange');

  logger.info(`Inventory ${operation} operation triggered for inventory ${doc.id}`);

  // Create operations
  if (operation === 'create') {
    await linkMilkBagsToInventory(doc, req, logger);
  }

  // Update operations
  if (operation === 'update') {
    // Update operation hooks here (if needed in the future)
  }

  /**
   * For both create and update operations, we want to ensure the organization's
   * stock is updated. Queue the stock update task for the associated organization
   * and execute it immediately to ensure the stock levels are accurate without delay.
   */
  const updateStockJob = await req.payload.jobs.queue({
    task: 'update-organization-stock-task',
    input: { organization: doc.organization },
  });

  const { jobStatus } = await req.payload.jobs.runByID({
    id: updateStockJob.id,
    req,
    overrideAccess: true,
  });

  logger.info(`Job: 'update-organization-stock-task', Status: ${jobStatus}`);
};
