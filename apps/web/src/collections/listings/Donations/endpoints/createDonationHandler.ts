import { createBadRequestError } from '@/lib/utils/createError';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { parseZodSchema } from '@/lib/utils/parseZodSchema';
import { donationCreateSchema, DonationCreateSchema } from '@lactalink/form-schemas/listings';
import { UserProfile } from '@lactalink/types';
import { DonationCreateResult } from '@lactalink/types/api';
import { Donation, Transaction } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest, RequiredDataFromCollectionSlug } from 'payload';

export const createDonationHandler = createPayloadHandler({
  requireAdmin: false,
  requireAuth: true,
  handler: handler,
  successMessage: 'Donation created successfully',
});

async function handler(req: PayloadRequest): Promise<DonationCreateResult> {
  const { payload, data, user } = req;

  if (!data) {
    throw createBadRequestError('No data provided for donation creation');
  }

  // User check is already handled by requireAuth, but we need to assert the type here for TypeScript
  if (!user?.profile) {
    throw createBadRequestError('User must have a profile to create a donation');
  }

  const parsedData = parseZodSchema(donationCreateSchema, data, {
    collection: 'donations',
    req: req,
  });

  const { type, ...restOfData } = parsedData;

  const donorDoc = await payload.findByID({
    req,
    collection: 'individuals',
    id: parsedData.donor,
    select: { givenName: true },
    depth: 0,
  });

  const image = await uploadDonationImage(req, donorDoc.givenName);

  const baseInput = buildBaseInput({ ...restOfData, imageID: image?.id, userID: user!.id });

  const createDonation = (input: typeof baseInput) =>
    payload.create({ req, collection: 'donations', data: input });

  let donation: Donation;
  let transaction: Transaction | null = null;

  switch (type) {
    case 'OPEN':
      donation = await createDonation(baseInput);
      break;

    case 'DIRECT':
      donation = await createDonation({
        ...baseInput,
        status: 'PENDING',
        recipient: parsedData.recipient,
      });
      break;

    case 'MATCHED': {
      [donation, transaction] = await createTransactionWithDelivery(req, {
        ...parsedData,
        userProfile: user.profile,
        baseInput: baseInput,
      });
      break;
    }

    default:
      throw createBadRequestError('Invalid donation type');
  }

  return { donation, transaction };
}

/**
 * Uploads a donation image if a file is provided.
 *
 * @param req - The Payload request object.
 * @param donorName - The donor's given name, used for the image alt text.
 * @returns The created image document, or `undefined` if no file was provided.
 */
async function uploadDonationImage(req: PayloadRequest, donorName: string) {
  const { file } = req;
  if (!file) return undefined;

  return req.payload.create({
    req,
    collection: 'images',
    file,
    data: { alt: `Image for donation by ${donorName}` },
  });
}

/**
 * Builds the base donation input from parsed form data.
 *
 * @param details - The donation bag details from the form.
 * @param image - The uploaded image ID, if any.
 * @param donorID - The ID of the donor individual.
 * @param deliveryPreferences - The donor's delivery preferences.
 * @param userID - The ID of the authenticated user creating the donation.
 * @returns A base input data ready for donation creation.
 */
function buildBaseInput({
  details,
  imageID,
  donor: donorID,
  deliveryPreferences,
  userID,
}: Pick<DonationCreateSchema, 'details' | 'deliveryPreferences' | 'donor'> & {
  imageID?: string;
  userID: string;
}): RequiredDataFromCollectionSlug<'donations'> {
  const volume = details.bags.reduce((total, bag) => total + bag.volume, 0);
  return {
    details: {
      ...details,
      milkSample: imageID ? [imageID] : undefined,
      bags: extractID(details.bags),
    },
    donor: donorID,
    deliveryPreferences: extractID(deliveryPreferences),
    status: 'AVAILABLE',
    volume,
    remainingVolume: volume,
    createdBy: userID,
    title: '', // Auto-generated so can be left blank
  };
}

/**
 * Creates a transaction and its associated delivery details for a matched donation,
 * then returns the fully populated donation and transaction documents.
 *
 * @param req - The Payload request object.
 * @param details - The donation bag details, used to populate milk bags on the transaction.
 * @param donor - The ID of the donor individual.
 * @param delivery - The delivery preferences from the parsed form data.
 * @param userProfile - The profile ID of the authenticated user, used as `initiatedBy`.
 * @returns A tuple of the fully populated `[Donation, Transaction]` documents.
 */
async function createTransactionWithDelivery(
  req: PayloadRequest,
  {
    details,
    donor,
    delivery,
    userProfile,
    baseInput,
    matchedRequest,
  }: {
    userProfile: UserProfile;
    baseInput: RequiredDataFromCollectionSlug<'donations'>;
  } & Extract<DonationCreateSchema, { type: 'MATCHED' }>
): Promise<[Donation, Transaction]> {
  const { payload } = req;
  const volume = details.bags.reduce((total, bag) => total + bag.volume, 0);

  const [donationDoc, requestDoc] = await Promise.all([
    payload.create({
      req,
      collection: 'donations',
      data: { ...baseInput, status: 'MATCHED' },
      depth: 0,
    }),
    payload.findByID({
      req,
      collection: 'requests',
      id: matchedRequest.id,
      select: { requester: true },
      depth: 0,
    }),
  ]);

  const transaction = await payload.create({
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
      sender: { relationTo: 'individuals', value: donor },
      recipient: { relationTo: 'individuals', value: extractID(requestDoc.requester) },
      // The following fields are placeholders to avoid TS errors;
      // the backend will overwrite them with calculated values.
      volume,
      txn: '',
      initiatedBy: userProfile,
      tracking: {},
    },
  });

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
    payload.findByID({ req, collection: 'transactions', id: transaction.id, depth: 3 }),
  ]);
}
