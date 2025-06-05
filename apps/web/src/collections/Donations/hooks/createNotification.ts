import { NotificationService } from '@/lib/services/notification';
import { Donation, Individual } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import _ from 'lodash';
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

    // Prepare additional variables for the notification
    const additionalVariables: Record<string, unknown> = {};

    if (doc.matchedRequests && doc.matchedRequests.length > 0) {
      additionalVariables.recipientCount = doc.matchedRequests.length;

      const newMatchedRequests = _.difference(
        doc.matchedRequests,
        previousDoc?.matchedRequests || []
      );

      if (newMatchedRequests.length) {
        additionalVariables.requestId = extractID(newMatchedRequests[0]!);

        try {
          const { requester } = await req.payload.findByID({
            collection: 'requests',
            id: extractID(newMatchedRequests[0]!),
            depth: 2,
            select: { requester: true },
          });

          additionalVariables.requesterName = (requester as Individual).displayName;
        } catch (error) {
          req.payload.logger.warn(
            `Failed to fetch requester for new matched request ${newMatchedRequests[0]} in donation ${doc.id}`
          );
        }
      }
    }

    const sentNotifications = await notificationService.createNotification({
      doc,
      previousDoc,
      operation,
      recipient: extractID(donor.owner),
      additionalVariables,
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
