import { Donation, MilkBag, Request } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterDeleteHook, CollectionSlug } from 'payload';

export const afterDeleteDonationOrRequest: CollectionAfterDeleteHook<Donation | Request> = async ({
  req,
  doc,
  collection,
}) => {
  const docsToDelete: { id: string; collection: CollectionSlug }[] = [];

  // Delete read tracking records
  const readCollection = collection.slug === 'donations' ? 'donation-reads' : 'request-reads';
  const entityField = collection.slug === 'donations' ? 'donation' : 'request';

  try {
    const readRecords = await req.payload.find({
      collection: readCollection,
      where: { [entityField]: { equals: doc.id } },
      depth: 0,
      pagination: false,
      req,
    });

    readRecords.docs.forEach((record) => {
      docsToDelete.push({ id: record.id, collection: readCollection });
    });
  } catch (error) {
    req.payload.logger.warn(
      `Failed to fetch read records for ${collection.slug} ${doc.id}: ${error}`
    );
  }

  const milkBags = doc.details.bags;

  if (milkBags?.length) {
    milkBags.forEach((bag) => {
      docsToDelete.push({ id: extractID(bag), collection: 'milkBags' });
    });
  }

  const images =
    'milkSample' in doc.details
      ? doc.details.milkSample
      : 'image' in doc.details
        ? doc.details.image
        : null;

  if (Array.isArray(images)) {
    images.forEach((img) => {
      docsToDelete.push({ id: extractID(img), collection: 'images' });
    });
  } else if (images) {
    docsToDelete.push({ id: extractID(images), collection: 'images' });
  }

  await Promise.all(
    docsToDelete.map(({ id, collection }) =>
      req.payload.delete({
        id,
        collection,
        req,
        overrideAccess: true,
      })
    )
  );

  req.payload.logger.info(
    {
      readRecords: docsToDelete.filter((item) => item.collection.includes('-reads')).length,
      milkBags: milkBags?.length || 0,
      images: Array.isArray(images) ? images.length : images ? 1 : 0,
      total: docsToDelete.length,
    },
    `Deleted associated documents for ${collection.labels.singular} ${doc.id}`
  );
};

export const afterDeleteMilkBags: CollectionAfterDeleteHook<MilkBag> = async ({
  req,
  doc,
  collection,
}) => {
  const docsToDelete: { id: string; collection: CollectionSlug }[] = [];

  const image = doc.bagImage;

  if (image) {
    docsToDelete.push({ id: extractID(image), collection: 'milk-bag-images' });
  }

  await Promise.all(
    docsToDelete.map(({ id, collection }) =>
      req.payload.delete({
        id,
        collection,
        req,
        overrideAccess: true,
      })
    )
  );

  req.payload.logger.info(
    {
      bagImage: 1,
    },
    `Deleted associated documents for ${collection.labels.singular} ${doc.id}`
  );
};
