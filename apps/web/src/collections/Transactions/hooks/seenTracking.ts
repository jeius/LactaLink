import { Transaction } from '@lactalink/types/payload-generated-types';
import { CollectionBeforeChangeHook } from 'payload';

export const initializeSeenTracking: CollectionBeforeChangeHook<Transaction> = ({
  operation,
  data,
}) => {
  if (operation !== 'create') return data;

  const seenStatusArray = data.tracking?.seenStatus || [];
  const defaultSeen = { seen: false, seenAt: null };

  if (data.sender) {
    seenStatusArray.push({ ...defaultSeen, seenBy: data.sender });
  }

  if (data.recipient) {
    seenStatusArray.push({ ...defaultSeen, seenBy: data.recipient });
  }

  data.tracking = {
    ...data.tracking,
    seenStatus: seenStatusArray,
  };

  return data;
};

export const updateSeenTracking: CollectionBeforeChangeHook<Transaction> = ({
  operation,
  data,
}) => {
  if (operation !== 'update') return data;

  const seenStatusArray = data.tracking?.seenStatus || [];

  const newStatusArray = seenStatusArray.map((status) => {
    const seenTimestamp = status.seenAt && new Date(status.seenAt);
    const lastUpdatedAt = new Date(data.updatedAt || data.createdAt || Date.now());

    if (!seenTimestamp) {
      status.seen = false;
    } else if (lastUpdatedAt > seenTimestamp) {
      status.seen = false;
    } else if (lastUpdatedAt <= seenTimestamp) {
      status.seen = true;
    }
    return status;
  });

  data.tracking = {
    ...data.tracking,
    seenStatus: newStatusArray,
  };

  return data;
};
