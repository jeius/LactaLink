import { deleteCollection } from '@/lib/api/delete';
import { uploadImage } from '@/lib/api/file';
import { getApiClient, getTransactionService } from '@lactalink/api';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { DonationCreateSchema } from '@lactalink/form-schemas';
import { Donation, MilkBag, Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { mergeDateTime } from '../utils/mergeDateTime';

/**
 * Type for resources that need cleanup if an error occurs
 */
type CleanupResources = {
  donationId?: string;
  milkImageId?: string;
  milkBagIds?: string[];
  matchedRequestId?: string;
  transactionId?: string;
};

/**
 * Process milk bags for a donation
 */
async function processMilkBags(milkBags: DonationCreateSchema['milkBags']) {
  const apiClient = getApiClient();

  const milkBagDocs = await Promise.all(
    milkBags.map(async (bag) => {
      const imageDoc = await uploadImage('milk-bag-images', bag.bagImage!);
      return apiClient.updateByID({
        collection: 'milkBags',
        id: bag.id,
        data: { bagImage: imageDoc.id },
        depth: 0,
      });
    })
  ).catch((error) => {
    console.error('Error processing milk bags:', error);
    throw error;
  });

  return milkBagDocs;
}

/**
 * Handle cleanup of resources if an error occurs
 */
async function handleCleanup(resources: CleanupResources) {
  const apiClient = getApiClient();
  const cleanupTasks = [];

  if (resources.donationId) {
    cleanupTasks.push(deleteCollection('donations', resources.donationId, { silent: true }));
  } else if (resources.milkImageId) {
    cleanupTasks.push(deleteCollection('images', resources.milkImageId, { silent: true }));
  }

  if (resources.matchedRequestId) {
    cleanupTasks.push(
      apiClient.updateByID({
        collection: 'requests',
        id: resources.matchedRequestId,
        data: { status: DONATION_REQUEST_STATUS.AVAILABLE.value },
      })
    );
  }

  if (resources.milkBagIds?.length) {
    cleanupTasks.push(
      apiClient.update({
        collection: 'milkBags',
        where: { id: { in: resources.milkBagIds } },
        data: { bagImage: null },
        depth: 0,
      })
    );
  }

  if (resources.transactionId) {
    cleanupTasks.push(deleteCollection('transactions', resources.transactionId, { silent: true }));
  }

  await Promise.all(cleanupTasks);
}

/**
 * Create a transaction for a matched donation
 */
async function createMatchedTransaction(
  data: DonationCreateSchema,
  donationDoc: Donation,
  milkBagDocs: MilkBag[],
  cleanupResources: CleanupResources
) {
  if (data.type !== 'MATCHED') {
    throw new Error('createMatchedTransaction called for non-matched donation');
  }
  const transactionService = getTransactionService();

  const date = mergeDateTime(data.delivery.date, data.delivery.time);

  const matchedRequestID = extractID(data.matchedRequest);
  cleanupResources.matchedRequestId = matchedRequestID;

  const transaction = await transactionService.createP2PTransaction({
    donation: donationDoc,
    request: matchedRequestID,
    milkBags: milkBagDocs,
    delivery:
      data.delivery.type === 'CONFIRMED'
        ? {
            confirmedAt: new Date().toISOString(),
            address: extractID(data.delivery.address),
            mode: data.delivery.mode,
            datetime: date.toISOString(),
            instructions: data.delivery.note,
          }
        : undefined,
  });

  if (data.delivery.type === 'PROPOSED') {
    cleanupResources.transactionId = transaction.id;
    return await transactionService.proposeDeliveryOption(transaction.id, {
      address: extractID(data.delivery.address),
      mode: data.delivery.mode,
      datetime: date.toISOString(),
      proposedBy: { relationTo: 'individuals', value: extractID(data.donor) },
      instructions: data.delivery.note,
    });
  }

  return transaction;
}

/**
 * Create a donation record and associated resources
 */
export async function createDonation(data: DonationCreateSchema) {
  const apiClient = getApiClient();
  const { details, donor, deliveryPreferences, type, milkBags } = data;
  const { image, ...restOfDetails } = details;
  const cleanupResources: CleanupResources = {};

  try {
    // Step 1: Process milk bags and upload images
    const milkBagDocs = await processMilkBags(milkBags);
    cleanupResources.milkBagIds = extractID(milkBagDocs);

    // Step 2: Upload milk sample image if present
    const milkImageDoc = image && (await uploadImage('images', image));
    if (milkImageDoc) {
      cleanupResources.milkImageId = milkImageDoc.id;
    }

    // Step 3: Calculate total volume
    const volume = milkBagDocs.reduce((sum, bag) => sum + bag.volume, 0);

    // Step 4: Create donation document
    const donationDoc = await apiClient.create({
      collection: 'donations',
      data: {
        volume: volume,
        remainingVolume: volume,
        donor: donor,
        status: DONATION_REQUEST_STATUS.AVAILABLE.value,
        details: {
          ...restOfDetails,
          bags: cleanupResources.milkBagIds,
          milkSample: milkImageDoc && [extractID(milkImageDoc)],
        },
        deliveryPreferences: extractID(deliveryPreferences),
        recipient: type === 'DIRECT' ? data.recipient : undefined,
      },
    });
    cleanupResources.donationId = donationDoc.id;

    // Step 5: Create transaction if this is a matched donation
    let transaction: Transaction | undefined;
    let message = 'Donation created successfully!';

    if (type === 'MATCHED') {
      transaction = await createMatchedTransaction(
        data,
        donationDoc,
        milkBagDocs,
        cleanupResources
      );

      const updatedRequest = extractCollection(transaction.request);
      const requesterName = extractCollection(updatedRequest?.requester)?.givenName || 'Requester';
      message = `Thank you! ${requesterName} has been notified of your donation.`;
    }

    return { message, transaction };
  } catch (error) {
    // Handle cleanup if anything fails
    await handleCleanup(cleanupResources);
    throw error;
  }
}
