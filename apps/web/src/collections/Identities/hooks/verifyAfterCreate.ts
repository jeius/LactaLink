import { Identity } from '@lactalink/types';
import { extractCollection, extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const verifyAfterCreate: CollectionAfterChangeHook<Identity> = async ({
  req,
  operation,
  doc,
}) => {
  if (operation !== 'create' || !doc.owner) return doc;

  const defaultQueryOptions = { req, depth: 0, overrideAccess: true };

  function getImage(id: string) {
    req.payload.logger.info(`Fetching identity image with ID: ${id}`);
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

  req.payload.logger.info(
    `Fetched images for identity ${doc.id}: queryImageUrl=${queryImageUrl}, refImageUrl=${refImageUrl}`
  );

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
