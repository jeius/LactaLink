import { getApiClient } from '@lactalink/api';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { getMeUser } from '../stores/meUserStore';

type Slug = Extract<CollectionSlug, 'donations' | 'notifications' | 'requests' | 'transactions'>;

export function markSeen<T extends Slug>(collection: T, id: string | string[]) {
  const apiClient = getApiClient();
  const ids = Array.isArray(id) ? id : [id];
  const now = new Date().toISOString();

  if (!ids.length) return Promise.resolve(undefined);

  return apiClient.update({
    collection,
    // @ts-expect-error seen and seenAt exist on all collections used here
    data: { seenAt: now, seen: true },
    where: { id: { in: ids } },
    depth: 5,
  });
}

export function markSeenTransaction(transactions: Transaction | Transaction[]) {
  const meUser = getMeUser();
  const meProfile = meUser?.profile;

  const inputTransactions = Array.isArray(transactions) ? transactions : [transactions];
  const now = new Date().toISOString();

  if (!inputTransactions.length) {
    throw new Error('No transactions provided to mark as seen.');
  }

  if (!meProfile) {
    throw new Error('No meUser profile found. Cannot mark transactions as seen.');
  }

  const updatedTransactions = inputTransactions.map((tx) => {
    const existingSeenStatus = tx.tracking?.seenStatus || [];
    const meProfileId = extractID(meProfile.value);

    // Find existing status for current user
    const existingStatusIndex = existingSeenStatus.findIndex(
      (status) => extractID(status.seenBy?.value) === meProfileId
    );

    let updatedSeenStatus;

    if (existingStatusIndex >= 0) {
      // Update existing status
      updatedSeenStatus = existingSeenStatus.map((status, index) =>
        index === existingStatusIndex && !status.seen
          ? { ...status, seen: true, seenAt: now }
          : status
      );
    } else {
      // Add new status for current user
      updatedSeenStatus = [
        ...existingSeenStatus,
        {
          seenBy: { relationTo: meProfile.relationTo, value: meProfileId },
          seen: true,
          seenAt: now,
        },
      ];
    }

    return { id: tx.id, seenStatus: updatedSeenStatus };
  });

  return updatedTransactions;
}
