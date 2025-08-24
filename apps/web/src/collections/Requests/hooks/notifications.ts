import { NotificationService } from '@/lib/services/notification';
import { AfterChangeHookParams } from '@/lib/types';
import { Notification, Request } from '@lactalink/types';
import { extractCollection, extractID } from '@lactalink/utilities';
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
    const options: AfterChangeHookParams<Request> = {
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
      `Sent ${flattenedNotifications.length} notifications for request ${doc.id} (${operation})`
    );
  } catch (error) {
    req.payload.logger.error(
      error,
      `Error creating notification for request ${doc.id} (${operation}):`
    );
  }

  return doc;
};

async function autoCreateNotifications<T extends Request>(
  service: NotificationService,
  options: AfterChangeHookParams<T>
): Promise<Notification[]> {
  const { doc, previousDoc, req, operation } = options;

  const requester = await req.payload.findByID({
    collection: 'individuals',
    id: extractID(doc.requester),
    req,
    depth: 0,
    select: { owner: true },
  });

  if (!requester.owner) {
    req.payload.logger.warn(`No user found for requester: ${requester.id} in donation ${doc.id}`);
    return [];
  }

  return await service.autoCreateNotifications({
    doc,
    previousDoc,
    operation,
    recipient: extractID(requester.owner),
  });
}

async function notifyRecipientOnCreate<T extends Request>(
  service: NotificationService,
  options: AfterChangeHookParams<T>
): Promise<Notification | null> {
  const { doc, req, operation } = options;

  // Only notify on creation of a new request with a specified recipient
  if (operation !== 'create' || !doc.recipient) {
    return null;
  }

  const request = await req.payload.findByID({
    collection: 'requests',
    id: doc.id,
    req,
    depth: 2,
    select: { requester: true, recipient: true },
    populate: {
      individuals: { displayName: true, owner: true },
      hospitals: { displayName: true, owner: true },
      milkBanks: { displayName: true, owner: true },
    },
  });

  const requesterName = extractCollection(request.requester)?.displayName || 'A requester';
  const recipient = extractCollection(request.recipient?.value)?.owner;
  const recipientID = extractID(recipient);

  if (!recipientID) {
    req.payload.logger.warn(`No user found for recipient in donation ${doc.id}`);
    return null;
  }

  return await service.createNotification({
    title: `New Milk Request from ${requesterName}`,
    message: `${requesterName} has requested milk donation from you. Please review the request.`,
    recipient: recipientID,
    categoryKey: 'MATCHING',
    priority: 'HIGH',
    relatedDoc: { relationTo: 'requests', value: doc.id },
  });
}
