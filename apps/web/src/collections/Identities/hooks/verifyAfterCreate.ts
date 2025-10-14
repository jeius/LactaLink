import { Identity } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';

export const verifyAfterChange: CollectionAfterChangeHook<Identity> = async ({ req, doc }) => {
  if (!doc.createdBy) return doc;

  const defaultQueryOptions = { req, depth: 0, overrideAccess: true };

  function getImage(id: string) {
    return req.payload.findByID({
      collection: 'identity-images',
      id,
      select: { url: true, filename: true },
      ...defaultQueryOptions,
    });
  }

  const [{ url: queryImageUrl }, { url: refImageUrl }] = await Promise.all([
    getImage(extractID(doc.idImage)),
    getImage(extractID(doc.refImage)),
  ]);

  if (!queryImageUrl || !refImageUrl) {
    req.payload.logger.error(
      `Failed to queue ID verification job for identity ${doc.id}. Missing image URLs.`
    );
    return doc;
  }

  const ownerDoc =
    extractCollection(doc.createdBy) ||
    (await req.payload.findByID({
      collection: 'users',
      id: extractID(doc.createdBy),
      select: { email: true },
      ...defaultQueryOptions,
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
