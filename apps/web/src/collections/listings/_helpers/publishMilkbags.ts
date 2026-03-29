import { hookLogger } from '@lactalink/agents/payload';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

/**
 * Publish all milk bags associated with a donation since they are drafts until
 * the donation is created.
 *
 * @param req - The Payload request object
 * @param doc - The donation document that was created
 * @param logger - The logger instance for logging information and errors
 * @returns void
 */
export async function publishMilkbags(
  req: PayloadRequest,
  doc: Donation,
  logger: ReturnType<typeof hookLogger>
) {
  if (req.signal?.aborted) {
    logger.warn('Request aborted before publishing milk bags');
    return;
  }

  const milkBagIDs = extractID(doc.details.bags);

  await req.payload.update({
    collection: 'milkBags',
    where: { id: { in: milkBagIDs } },
    data: { _status: 'published' },
    req,
  });

  logger.info(`Published ${milkBagIDs.length} milk bags associated with donation ${doc.id}`);
}
