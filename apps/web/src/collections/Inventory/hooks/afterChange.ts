import { InventoryHookContext } from '@/lib/constants/hookContexts';
import { getHookContext, hookLogger } from '@lactalink/agents/payload';
import { Inventory } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook, PayloadRequest, RequestContext } from 'payload';

export const afterChange: CollectionAfterChangeHook<Inventory> = async ({
  doc,
  operation,
  req,
  collection,
}) => {
  const logger = hookLogger(req, collection.slug, 'afterChange');

  // Create operations
  if (operation === 'create') {
    await linkMilkBagsToInventory(doc, req).then((msg) => {
      if (msg) logger.info(msg);
    });
  }

  // Update operations
  if (operation === 'update') {
    // Update operation hooks here (if needed in the future)
  }

  /**
   * For both create and update operations, we want to ensure the organization's
   * stock is updated. Queue the stock update task for the associated organization
   */
  const updateStockJob = await req.payload.jobs.queue({
    task: 'update-organization-stock-task',
    input: { organization: doc.organization },
  });

  // Execute the job immediately to ensure the stock is updated without delay.
  req.payload.jobs.runByID({ id: updateStockJob.id, req, overrideAccess: true });
};

async function linkMilkBagsToInventory(doc: Inventory, req: PayloadRequest) {
  const milkBags = getHookContext<RequestContext['milkbags']>(req, InventoryHookContext.MilkBagIDs);

  const milkBagIDs = extractID(milkBags);

  if (!milkBagIDs || milkBagIDs.length === 0) return null;

  await req.payload.update({
    collection: 'milkBags',
    where: { id: { in: milkBagIDs } },
    data: { inventory: doc.id },
    req,
  });

  return `Linked ${milkBagIDs.length} milk bags to inventory ${doc.id}`;
}
