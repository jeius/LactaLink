import { InventoryHookContext } from '@/lib/constants/hookContexts';
import { getHookContext, hookLogger } from '@lactalink/agents/payload';
import { Inventory } from '@lactalink/types/payload-generated-types';
import { CollectionAfterChangeHook, PayloadRequest } from 'payload';

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
};

async function linkMilkBagsToInventory(doc: Inventory, req: PayloadRequest) {
  const milkBagIDs = getHookContext<string[]>(req, InventoryHookContext.MilkBagIDs);

  if (!milkBagIDs || milkBagIDs.length === 0) return null;

  await req.payload.update({
    collection: 'milkBags',
    where: { id: { in: milkBagIDs } },
    data: { inventory: doc.id },
    req,
  });

  return `Linked ${milkBagIDs.length} milk bags to inventory ${doc.id}`;
}
