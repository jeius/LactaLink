import { NotificationService } from '@/lib/services/notification';
import { AfterChangeHookParams } from '@/lib/types';
import { Donation, Notification } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';

export const createDonationNotification: CollectionAfterChangeHook<Donation> = async ({
  doc,
  previousDoc,
  operation,
  req,
  collection,
}) => {
  try {
    const notificationService = new NotificationService(req, collection);
    const options: AfterChangeHookParams<Donation> = {
      doc,
      previousDoc,
      req,
      operation,
      collection,
    };

    const sentNotifications = await Promise.all([
      autoCreateNotifications(notificationService, options),
      notifyRecipientOnCreate(notificationService, options),
    ]);

    const flattenedNotifications = sentNotifications.filter((v) => v !== null).flat();

    req.payload.logger.info(
      `Sent ${flattenedNotifications.length} notifications for donation ${doc.id} (${operation})`
    );
  } catch (error) {
    req.payload.logger.error(
      error,
      `Error creating notification for donation ${doc.id} (${operation})`
    );
  }

  return doc;
};

async function autoCreateNotifications<T extends Donation>(
  service: NotificationService,
  options: AfterChangeHookParams<T>
): Promise<Notification[]> {
  const { doc, previousDoc, req, operation } = options;

  const donor = await req.payload
    .findByID({
      collection: 'individuals',
      req,
      id: extractID(doc.donor),
      depth: 0,
      select: { owner: true },
    })
    .catch(() => {
      throw new Error(`Donor not found: ${extractID(doc.donor)}`);
    });

  if (!donor.owner) {
    req.payload.logger.warn(
      `No user found for donor ${extractID(doc.donor)} in donation ${doc.id}`
    );
    return [];
  }

  return await service.autoCreateNotifications({
    doc,
    previousDoc,
    operation,
    recipient: extractID(donor.owner),
  });
}

async function notifyRecipientOnCreate<T extends Donation>(
  service: NotificationService,
  options: AfterChangeHookParams<T>
): Promise<Notification | null> {
  const { doc, req, operation } = options;

  if (!doc.recipient || operation !== 'create') {
    return null;
  }

  const donation = await req.payload.findByID({
    collection: 'donations',
    id: doc.id,
    req,
    depth: 2,
    select: { donor: true, recipient: true },
    populate: {
      individuals: { displayName: true, owner: true },
      hospitals: { displayName: true, owner: true },
      milkBanks: { displayName: true, owner: true },
    },
  });

  const donorName = extractCollection(donation.donor)?.displayName || 'A donor';
  const recipient = extractCollection(donation.recipient?.value)?.owner;
  const recipientID = extractID(recipient);

  if (!recipientID) {
    req.payload.logger.warn(`No user found for recipient in donation ${doc.id}`);
    return null;
  }

  return await service.createNotification({
    title: `New Milk Donation from ${donorName}`,
    message: `${donorName} has made a donation intended for you. You may choose to accept or decline this donation.`,
    recipient: recipientID,
    categoryKey: 'MATCHING',
    priority: 'HIGH',
    relatedDoc: { relationTo: 'donations', value: doc.id },
  });
}
