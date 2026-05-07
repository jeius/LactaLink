import { DeliveryCreateSchema } from '@lactalink/form-schemas';
import { DeliveryDetail, Transaction } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

/**
 * Helper function to create a delivery detail document based on the provided delivery
 * information and transaction.
 *
 * This function is used in both donation and request creation handlers to ensure
 * consistent creation of delivery details.
 *
 * @param params.req - The Payload request object.
 * @param params.delivery - The delivery information from the form, including type,
 * date, time, mode, address, and notes.
 * @param params.transaction - The transaction document that the delivery detail
 * will be associated with.
 * @returns A promise that resolves to the created DeliveryDetail document.
 */
export async function createDeliveryDetail({
  req,
  delivery,
  transaction,
}: {
  req: PayloadRequest;
  delivery: DeliveryCreateSchema;
  transaction: Transaction;
}): Promise<DeliveryDetail> {
  const { payload } = req;

  const scheduledDate = new Date(delivery.date);
  const scheduledTime = new Date(delivery.time);
  scheduledDate.setHours(scheduledTime.getHours(), scheduledTime.getMinutes());

  return payload.create({
    req,
    collection: 'delivery-details',
    depth: 0,
    data: {
      transaction: transaction.id,
      status: delivery.type === 'CONFIRMED' ? 'ACCEPTED' : 'PENDING',
      address: extractID(delivery.address),
      proposedBy: transaction.initiatedBy,
      method: delivery.mode,
      scheduledAt: scheduledDate.toISOString(),
      notes: delivery.note,
    },
  });
}
