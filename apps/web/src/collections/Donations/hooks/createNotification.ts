import { NotificationService } from '@/lib/services/notification';
import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const createDonationNotification: CollectionAfterChangeHook<Donation> = async ({
  doc,
  previousDoc,
  operation,
  req,
  collection,
  context,
}) => {
  try {
    const notificationService = new NotificationService(req, collection);
    const donor = await req.payload.findByID({
      collection: 'individuals',
      id: extractID(doc.donor),
      depth: 0,
      select: { owner: true },
    });

    if (!donor.owner) {
      req.payload.logger.warn(`No owner found for donor ${donor.id} in donation ${doc.id}`);
      return doc; // Skip notification if no owner
    }

    const sentNotifications = await notificationService.createNotification({
      doc,
      previousDoc,
      operation,
      recipient: extractID(donor.owner),
    });

    req.payload.logger.info(
      `Sent ${sentNotifications.length} notifications for donation ${doc.id} (${operation})`
    );
  } catch (error) {
    req.payload.logger.error(
      error,
      `Error creating notification for donation ${doc.id} (${operation})`
    );
  }

  return doc;
};
