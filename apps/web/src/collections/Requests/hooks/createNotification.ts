import { NotificationService } from '@/lib/services/notification';
import { Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const requestAfterChange: CollectionAfterChangeHook<Request> = async ({
  doc,
  previousDoc,
  operation,
  req,
  collection,
}) => {
  try {
    const notificationService = new NotificationService(req, collection);
    const recipient = extractID(doc.requester);

    // const sentNotifications = await notificationService.createNotification({
    //   doc: fullDoc,
    //   previousDoc,
    //   operation,
    //   recipient,
    // });

    // req.payload.logger.info(
    //   `Sent ${sentNotifications.length} notifications for donation ${doc.id} (${operation})`
    // );
  } catch (error) {
    req.payload.logger.error(
      error,
      `Error creating notification for request ${doc.id} (${operation}):`
    );
  }
};
