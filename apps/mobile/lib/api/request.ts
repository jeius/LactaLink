import { deleteCollection } from '@/lib/api/delete';
import { uploadImage } from '@/lib/api/file';
import { getApiClient, getTransactionService } from '@lactalink/api';
import { RequestCreateSchema } from '@lactalink/form-schemas';
import { Request, Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { mergeDateTime } from '../utils/mergeDateTime';

/**
 * Type for resources that need cleanup if an error occurs
 */
type CleanupResources = {
  requestId?: string;
  imageId?: string;
  transactionId?: string;
};

/**
 * Handle cleanup of resources if an error occurs
 */
async function handleCleanup(resources: CleanupResources) {
  const cleanupTasks = [];

  if (resources.requestId) {
    cleanupTasks.push(deleteCollection('requests', resources.requestId, { silent: true }));
  } else if (resources.imageId) {
    cleanupTasks.push(deleteCollection('images', resources.imageId, { silent: true }));
  }

  if (resources.transactionId) {
    cleanupTasks.push(deleteCollection('transactions', resources.transactionId, { silent: true }));
  }

  await Promise.all(cleanupTasks);
}

/**
 * Create a transaction for a matched request
 */
async function createMatchedTransaction(
  data: RequestCreateSchema,
  requestDoc: Request,
  cleanupResources: CleanupResources
) {
  if (data.type !== 'MATCHED') {
    throw new Error('createMatchedTransaction called for non-matched request');
  }

  const transactionService = getTransactionService();

  const date = mergeDateTime(data.delivery.date, data.delivery.time);

  const matchedDonation = extractID(data.matchedDonation);

  const transaction = await transactionService.createP2PTransaction({
    donation: matchedDonation,
    request: requestDoc.id,
    milkBags: extractID(data.details.bags),
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
      proposedBy: { relationTo: 'individuals', value: extractID(data.requester) },
      instructions: data.delivery.note,
    });
  }

  return transaction;
}

/**
 * Create a request record and associated resources
 */
export async function createRequest(data: RequestCreateSchema) {
  const apiClient = getApiClient();
  const { deliveryPreferences, details, requester, volumeNeeded, type } = data;
  const cleanupResources: CleanupResources = {};

  try {
    // Step 1: Upload image if present
    const imageDoc = details.image && (await uploadImage('images', details.image));
    if (imageDoc) {
      cleanupResources.imageId = imageDoc.id;
    }

    // Step 2: Create request document
    const requestDoc = await apiClient.create({
      collection: 'requests',
      data: {
        requester,
        status: 'AVAILABLE',
        details: {
          ...details,
          image: imageDoc && extractID(imageDoc),
          bags: extractID(details.bags),
        },
        deliveryPreferences: extractID(deliveryPreferences),
        initialVolumeNeeded: volumeNeeded,
        volumeNeeded,
        volumeFulfilled: 0,
        recipient: type === 'DIRECT' ? data.recipient : undefined,
      },
    });
    cleanupResources.requestId = requestDoc.id;

    // Step 3: Create transaction if this is a matched request
    let transaction: Transaction | undefined;
    let message = 'Request created successfully!';

    if (type === 'MATCHED') {
      transaction = await createMatchedTransaction(data, requestDoc, cleanupResources);

      const donation = extractCollection(transaction.donation);
      const donorName = extractCollection(donation?.donor)?.givenName || 'Donor';
      message = `Thank you! ${donorName} has been notified of your request.`;
    }

    return { transaction, message };
  } catch (error) {
    // Handle cleanup if anything fails
    await handleCleanup(cleanupResources);
    throw error;
  }
}
