import { NotificationService } from '@/lib/services/notification';
import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const donationAfterChange: CollectionAfterChangeHook<Donation> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const notificationService = new NotificationService(req.payload);

  const donor = await req.payload.findByID({
    collection: 'individuals',
    id: extractID(doc.donor),
    depth: 2,
  });

  // New donation created
  if (operation === 'create') {
    await notificationService.createNotification({
      recipient: donor.id,
      typeKey: 'DONATION_CREATED',
      variables: {
        donorName: donor.displayName,
        volume: doc.volume,
        donationId: doc.id,
      },
      relatedData: {
        data: { relationTo: 'donations', value: doc.id },
        actionUrl: `/app/donations/${doc.id}`,
        actionLabel: 'View Donation',
      },
    });
  }

  // Donation status changes
  if (operation === 'update' && doc.status !== previousDoc?.status) {
    switch (doc.status) {
      case 'MATCHED':
        await notificationService.createNotification({
          recipient: donor.id,
          typeKey: 'DONATION_MATCHED',
          variables: {
            donorName: donor.displayName,
            recipientName: doc.matchedRequest?.requester?.name,
            volume: doc.volume,
          },
          relatedData: {
            data: { relationTo: 'donations', value: doc.id },
            actionUrl: `/app/donations/${doc.id}/match`,
            actionLabel: 'View Match Details',
          },
        });
        break;

      case 'COLLECTED':
        await notificationService.createNotification({
          recipient: donor.id,
          typeKey: 'DONATION_COLLECTED',
          variables: {
            donorName: donor.displayName,
            collectionDate: new Date().toLocaleDateString(),
          },
          relatedData: {
            data: { relationTo: 'donations', value: doc.id },
            actionUrl: `/app/donations/${doc.id}`,
            actionLabel: 'View Donation',
          },
        });
        break;
    }
  }
};
