import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { PayloadRequest } from 'payload';

export const validateExpiryHandler = createPayloadHandler({
  requireAuth: false,
  requireAdmin: false,
  requireCRONRobot: true,
  handler: handler,
});

async function handler(req: PayloadRequest) {
  // This handler will be called by a CRON job to validate milk bag expirations.

  const statusesToExpire: MilkBag['status'][] = ['DRAFT', 'AVAILABLE', 'ALLOCATED'];

  const result = await req.payload.update({
    collection: 'milkBags',
    data: { status: 'EXPIRED' },
    where: {
      and: [
        { status: { in: statusesToExpire } },
        { expiresAt: { less_than: new Date().toISOString() } },
      ],
    },
    depth: 0,
    req,
  });

  return {
    ...result,
    message: `Updated ${result.docs.length} milk bags to EXPIRED status.`,
  };
}
