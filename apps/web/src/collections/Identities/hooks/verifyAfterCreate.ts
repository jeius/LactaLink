import { JOB_QUEUES } from '@/lib/constants/jobs';
import { Identity } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const verifyAfterCreate: CollectionAfterChangeHook<Identity> = async ({
  req,
  operation,
  doc,
}) => {
  if (operation !== 'create') return doc;

  const findByID = (id: string) =>
    req.payload.findByID({
      collection: 'identity-images',
      id,
      req,
      depth: 0,
      select: { url: true },
    });

  const [{ url: queryImageUrl }, { url: refImageUrl }] = await Promise.all([
    findByID(extractID(doc.idImage)),
    findByID(extractID(doc.refImage)),
  ]);

  if (!queryImageUrl || !refImageUrl) {
    req.payload.logger.error(
      `Failed to queue ID verification job for identity ${doc.id}. Missing image URLs.`
    );
    return doc;
  }

  // Queue the ID verification job
  const job = await req.payload.jobs.queue({
    task: 'id-verification',
    input: { queryImageUrl, refImageUrl, identityID: doc.id },
    queue: JOB_QUEUES['id-verification'],
    req,
  });

  req.payload.jobs.runByID({ id: job.id, overrideAccess: true, req }).catch((error) => {
    req.payload.logger.error(
      `Error running ID verification job ${job.id} for identity ${doc.id}: ${error.message}`
    );
  });

  return doc;
};
