import { createBadRequestError } from '@/lib/utils/createError';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { parseZodSchema } from '@/lib/utils/parseZodSchema';
import { RequestCreateSchema, requestCreateSchema } from '@lactalink/form-schemas/listings';
import { UserProfile } from '@lactalink/types';
import { RequestCreateResult } from '@lactalink/types/api';
import { Request, Transaction } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest, RequiredDataFromCollectionSlug } from 'payload';

export const requestCreationHandler = createPayloadHandler({
  requireAdmin: false,
  requireAuth: true,
  handler: handler,
  successMessage: 'Request created successfully',
});

async function handler(req: PayloadRequest): Promise<RequestCreateResult> {
  const { payload, data, user } = req;

  if (!data) {
    throw createBadRequestError('No data provided for request creation');
  }

  // User check is already handled by requireAuth, but we need to assert the type here for TypeScript
  if (!user?.profile) {
    throw createBadRequestError('User must have a profile to create a request');
  }

  const parsedData = parseZodSchema(requestCreateSchema, data, {
    collection: 'requests',
    req: req,
  });

  const { type } = parsedData;

  const requesterDoc = await payload.findByID({
    req,
    collection: 'individuals',
    id: parsedData.requester,
    select: { givenName: true },
    depth: 0,
  });

  const image = await uploadImage(req, requesterDoc.givenName);

  const baseInput = buildBaseInput({ ...parsedData, imageID: image?.id, userID: user!.id });

  const createDoc = (input: typeof baseInput) =>
    payload.create({ req, collection: 'requests', data: input });

  let request: Request;
  let transaction: Transaction | null = null;

  switch (type) {
    case 'OPEN':
      request = await createDoc(baseInput);
      break;

    case 'DIRECT':
      request = await createDoc({
        ...baseInput,
        status: 'PENDING',
        recipient: parsedData.recipient,
      });
      break;

    case 'MATCHED': {
      [request, transaction] = await createTransaction(req, {
        ...parsedData,
        userProfile: user.profile,
        baseInput: baseInput,
      });
      break;
    }

    default:
      throw createBadRequestError('Invalid request type');
  }

  return { request, transaction };
}

/**
 * Uploads an image if a file is provided.
 *
 * @param req - The Payload request object.
 * @param name - The given name, used for the image alt text.
 * @returns The created image document, or `undefined` if no file was provided.
 */
async function uploadImage(req: PayloadRequest, name: string) {
  const { file } = req;
  if (!file) return undefined;

  return req.payload.create({
    req,
    collection: 'images',
    file,
    data: { alt: `Image for request by ${name}` },
  });
}

function buildBaseInput({
  imageID,
  userID,
  ...rest
}: RequestCreateSchema & {
  imageID?: string;
  userID: string;
}): RequiredDataFromCollectionSlug<'requests'> {
  const bags = rest.details.bags;

  return {
    status: 'AVAILABLE',
    details: {
      ...rest.details,
      image: imageID,
      bags: bags ? extractID(bags) : undefined,
    },
    requester: rest.requester,
    deliveryPreferences: extractID(rest.deliveryPreferences),
    initialVolumeNeeded: rest.volumeNeeded,
    volumeNeeded: rest.volumeNeeded,
    volumeFulfilled: 0,
    createdBy: userID,
    title: '', // Auto-generated so can be left blank
  };
}

async function createTransaction(
  req: PayloadRequest,
  {
    details,
    requester,
    delivery,
    userProfile,
    baseInput,
    matchedDonation,
  }: {
    userProfile: UserProfile;
    baseInput: RequiredDataFromCollectionSlug<'requests'>;
  } & Extract<RequestCreateSchema, { type: 'MATCHED' }>
): Promise<[Request, Transaction]> {
  const { payload } = req;
  const volume = details.bags.reduce((total, bag) => total + bag.volume, 0);

  const [requestDoc, donationDoc] = await Promise.all([
    payload.create({
      req,
      collection: 'requests',
      data: { ...baseInput, status: 'MATCHED' },
      depth: 0,
    }),
    payload.findByID({
      req,
      collection: 'donations',
      id: matchedDonation.id,
      select: { donor: true },
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
      sender: { relationTo: 'individuals', value: requester },
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
    payload.findByID({ req, collection: 'requests', id: requestDoc.id, depth: 3 }),
    payload.findByID({ req, collection: 'transactions', id: transaction.id, depth: 3 }),
  ]);
}
