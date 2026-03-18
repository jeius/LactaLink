import { createBadRequestError } from '@/lib/utils/createError';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { parseZodSchema } from '@/lib/utils/parseZodSchema';
import { donationCreateSchema } from '@lactalink/form-schemas/listings';
import { Donation, Transaction } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest, RequiredDataFromCollectionSlug } from 'payload';

export const createDonationHandler = createPayloadHandler({
  requireAdmin: false,
  requireAuth: true,
  handler: handler,
  successMessage: 'Donation created successfully',
});

async function handler(req: PayloadRequest) {
  const { payload, data, file, user } = req;

  if (!data) {
    throw createBadRequestError('No data provided for donation creation');
  }

  if (!user?.profile) {
    throw createBadRequestError('User must have a profile to create a donation');
  }

  const parsedData = parseZodSchema(donationCreateSchema, data, {
    collection: 'donations',
    req: req,
  });

  const { donor: donorID, type, deliveryPreferences, details } = parsedData;

  const donorDoc = await payload.findByID({
    req,
    collection: 'individuals',
    id: donorID,
    select: { givenName: true },
    depth: 0,
  });

  const image =
    file &&
    (await payload.create({
      req,
      collection: 'images',
      file: file,
      data: { alt: `Image for donation by ${donorDoc.givenName}` },
    }));

  const volume = details.bags.reduce((total, bag) => total + bag.volume, 0);

  const inputData: RequiredDataFromCollectionSlug<'donations'> = {
    details: { ...details, milkSample: image && [image.id], bags: extractID(details.bags) },
    donor: donorID,
    deliveryPreferences: extractID(deliveryPreferences),
    status: 'AVAILABLE',
    volume: volume,
    remainingVolume: volume,
    createdBy: user!.id, // Safe to assert due to requireAuth
    title: '', // Auto-generated so can be left blank
  };

  const createDonation = (input: typeof inputData) =>
    payload.create({
      req,
      collection: 'donations',
      data: input,
    });

  let donation: Donation;
  let transaction: Transaction | null = null;

  switch (type) {
    case 'OPEN':
      donation = await createDonation(inputData);
      break;

    case 'DIRECT':
      donation = await createDonation({
        ...inputData,
        status: 'PENDING',
        recipient: parsedData.recipient,
      });
      break;

    case 'MATCHED': {
      const { matchedRequest, delivery } = parsedData;

      const [donationDoc, requestDoc] = await Promise.all([
        createDonation({ ...inputData, status: 'MATCHED' }),
        payload.findByID({
          req,
          collection: 'requests',
          id: matchedRequest.id,
          select: { requester: true },
          depth: 0,
        }),
      ]);

      [donation, transaction] = await payload
        .create({
          req,
          depth: 0,
          collection: 'transactions',
          select: { initiatedBy: true },
          data: {
            type: 'P2P',
            status: 'PENDING',
            donation: donationDoc.id,
            request: requestDoc.id,
            milkBags: extractID(details.bags),
            sender: { relationTo: 'individuals', value: donorID },
            recipient: { relationTo: 'individuals', value: extractID(requestDoc.requester) },
            // The following fields below are placeholders to avoid ts errors
            // The backend will overwrite them with calculated values
            volume: volume,
            txn: '',
            initiatedBy: user.profile,
            tracking: {},
          },
        })
        .then(async (transaction) => {
          await payload.create({
            req,
            collection: 'delivery-details',
            depth: 0,
            data: {
              transaction: transaction.id,
              status: delivery.type === 'CONFIRMED' ? 'ACCEPTED' : 'PENDING',
              address: extractID(delivery.address),
              proposedBy: transaction.initiatedBy,
              method: delivery.mode,
              scheduledAt: delivery.time,
              notes: delivery.note,
            },
          });

          return Promise.all([
            payload.findByID({ req, collection: 'donations', id: donationDoc.id, depth: 3 }),
            payload.findByID({
              req,
              collection: 'transactions',
              id: transaction.id,
              depth: 3,
            }),
          ]);
        });
      break;
    }

    default:
      throw createBadRequestError('Invalid donation type');
  }

  return { donation, transaction };
}
