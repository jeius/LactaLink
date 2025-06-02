import { NotificationService } from '@/lib/services/notification';
import { Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const requestAfterChange: CollectionAfterChangeHook<Request> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const notificationService = new NotificationService(req);
  const recipient = extractID(doc.requester);

  const fullDoc = await req.payload.findByID({
    collection: 'requests',
    id: doc.id,
    depth: 5,
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
};
