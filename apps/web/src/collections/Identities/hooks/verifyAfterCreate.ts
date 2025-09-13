import { Identity } from '@lactalink/types';
import { extractCollection, extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const verifyAfterCreate: CollectionAfterChangeHook<Identity> = async ({
  req,
  operation,
  doc,
}) => {
  if (operation !== 'create' || !doc.owner) return doc;

  const findByID = (id: string) =>
    req.payload.findByID({
      collection: 'identity-images',
      id,
      req,
      depth: 0,
      select: { url: true },
      overrideAccess: true,
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

  const ownerDoc =
    extractCollection(doc.owner) ||
    (await req.payload.findByID({
      collection: 'users',
      id: extractID(doc.owner),
      req,
      depth: 0,
      overrideAccess: true,
      select: { email: true },
    }));

  // Queue the ID verification job
  const job = await req.payload.jobs.queue({
    workflow: 'id-verification-workflow',
    input: { queryImageUrl, refImageUrl, identityID: doc.id, email: ownerDoc.email },
    req,
  });

  req.payload.jobs.runByID({ id: job.id, overrideAccess: true, req }).catch((error) => {
    req.payload.logger.error(
      `Error running ID verification job ${job.id} for identity ${doc.id}: ${error.message}`
    );
  });

  return doc;
};
