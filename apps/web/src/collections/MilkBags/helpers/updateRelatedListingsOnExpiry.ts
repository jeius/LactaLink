import { hookLogger } from '@lactalink/agents/payload';
import { DonationRequestStatus } from '@lactalink/types';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { PayloadRequest } from 'payload';

const statusesToExpire: DonationRequestStatus[] = ['AVAILABLE', 'PENDING', 'MATCHED'];

export async function updateRelatedListingsOnExpiry({
  req,
  doc,
  previousDoc,
  logger,
}: {
  req: PayloadRequest;
  doc: MilkBag;
  previousDoc: MilkBag | null;
  logger?: ReturnType<typeof hookLogger>;
}) {
  // Only proceed if the bag has expired
  if (doc.status !== 'EXPIRED') return;

  // Only proceed if it just transitioned to EXPIRED (i.e., it wasn't already expired before)
  // This prevents unnecessary updates if the bag was already expired and is being read again
  // or if the status was updated to EXPIRED in a previous operation.
  const previousStatus = previousDoc?.status;
  if (previousStatus === 'EXPIRED') return;

  const update = async (collection: 'donations' | 'requests') => {
    const { docs } = await req.payload.update({
      collection,
      where: {
        and: [{ status: { in: statusesToExpire } }, { 'details.bags': { contains: doc.id } }],
      },
      data: { status: 'EXPIRED' },
      depth: 0,
      req,
    });

    logger?.info(
      `Updated ${docs.length ?? 0} ${collection} to EXPIRED status due to expiring milk bag.`,
      { milkbagID: doc.id }
    );
  };

  return Promise.all([update('donations'), update('requests')]);
}
