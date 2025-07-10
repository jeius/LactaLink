import { Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload';

export const updateMilkBag: CollectionAfterChangeHook<Request> = async ({ doc, req, context }) => {
  if (!doc.details?.bags || doc.details.bags.length === 0 || !context.updateMilkBag) {
    return doc;
  }

  req.payload.logger.info(
    {
      requestId: doc.id,
      bags: doc.details.bags.map((bag) => extractID(bag)),
    },
    'Updating milk bags for matched request'
  );

  await Promise.all(
    doc.details.bags.map(async (bag) => {
      return await req.payload.update({
        collection: 'milkBags',
        id: extractID(bag),
        data: { status: 'ALLOCATED' },
        req,
        overrideAccess: true,
      });
    })
  );

  if (doc.matchedDonation) {
    const { matchedRequests } = await req.payload.findByID({
      collection: 'donations',
      id: extractID(doc.matchedDonation),
      depth: 0,
      select: { matchedRequests: true },
      overrideAccess: true,
    });

    const newMatchedRequests =
      matchedRequests && matchedRequests.length > 0
        ? [...extractID(matchedRequests), doc.id]
        : [doc.id];

    await req.payload.update({
      collection: 'donations',
      id: extractID(doc.matchedDonation),
      req,
      data: {
        matchedRequests: newMatchedRequests,
      },
      overrideAccess: true,
    });
  }

  return doc;
};

export const updateStatus: CollectionBeforeChangeHook<Request> = async ({
  data,
  operation,
  originalDoc,
  context,
  req,
}) => {
  if (context.skipRequestUpdateHook) {
    req.payload.logger.info(
      { requestId: originalDoc?.id },
      'Skipping request status update due to context flag'
    );
    context.updateMilkBag = false; // Ensure milk bag update is not triggered
    return data;
  }

  if (operation === 'create' && data.matchedDonation) {
    data.status = 'MATCHED';
    data.matchedAt = new Date().toISOString();
    context.updateMilkBag = true; // Indicate that milk bags should be updated after creation
  } else if (operation === 'update' && !originalDoc?.matchedDonation && data.matchedDonation) {
    data.status = 'MATCHED';
    data.matchedAt = new Date().toISOString();
    context.updateMilkBag = true; // Indicate that milk bags should be updated after update
  }

  context.skipRequestUpdateHook = true; // Prevent further status updates in this operation

  return data;
};
