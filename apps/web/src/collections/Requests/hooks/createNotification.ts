import { NotificationService } from '@/lib/services/notification';
import { Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const createRequestNotification: CollectionAfterChangeHook<Request> = async ({
  doc,
  previousDoc,
  operation,
  req,
  collection,
}) => {
  try {
    const notificationService = new NotificationService(req, collection);

    const requester = await req.payload.findByID({
      collection: 'individuals',
      id: extractID(doc.requester),
      depth: 0,
      select: { owner: true },
      req,
    });

    if (!requester.owner) {
      req.payload.logger.warn(`No owner found for donor ${requester.id} in donation ${doc.id}`);
      return doc; // Skip notification if no owner
    }

    const sentNotifications = await notificationService.autoCreateNotifications({
      doc,
      previousDoc,
      operation,
      recipient: extractID(requester.owner),
    });

    req.payload.logger.info(
      `Sent ${sentNotifications.length} notifications for request ${doc.id} (${operation})`
    );
  } catch (error) {
    req.payload.logger.error(
      error,
      `Error creating notification for request ${doc.id} (${operation}):`
    );
  }

  return doc;
};
