import { Collections } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

type CollectionWithSeenTracking = Extract<
  Collections,
  { seen?: boolean | null; seenAt?: string | null }
>;

export const updateSeenTracking: CollectionBeforeChangeHook<CollectionWithSeenTracking> = ({
  data,
  operation,
}) => {
  if (operation === 'create') {
    data.seen = false;
    data.seenAt = null;
  } else if (operation === 'update') {
    const seenTimestamp = data.seenAt && new Date(data.seenAt);
    const lastUpdatedAt = new Date(data.updatedAt || data.createdAt || Date.now());

    if (!seenTimestamp) {
      data.seen = false;
    } else if (lastUpdatedAt > seenTimestamp) {
      data.seen = false;
    } else if (lastUpdatedAt <= seenTimestamp) {
      data.seen = true;
    }

    if ('read' in data && data.read === true) {
      data.seen = true;
      data.seenAt = data.readAt;
    }
  }

  return data;
};
