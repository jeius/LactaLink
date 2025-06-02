import { NotificationService } from '@/lib/services/notification';
import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const createDonationNotification: CollectionAfterChangeHook<Donation> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  try {
    const notificationService = new NotificationService(req);
    const recipient = extractID(doc.donor);

    const fullDoc = await req.payload.findByID({
      collection: 'donations',
      id: doc.id,
      depth: 5,
      joins: {
        matchedRequests: { sort: '-createdAt', count: true },
      },
    });

    const sentNotifications = await notificationService.createNotification({
      doc: fullDoc,
      previousDoc,
      operation,
      recipient,
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
};
