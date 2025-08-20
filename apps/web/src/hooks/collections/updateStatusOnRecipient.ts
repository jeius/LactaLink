import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Donation, Request } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

const pendingStatus = DONATION_REQUEST_STATUS.PENDING.value;
const availableStatus = DONATION_REQUEST_STATUS.AVAILABLE.value;

export const updateStatusOnRecipient: CollectionBeforeChangeHook<Donation | Request> = ({
  operation,
  data,
}) => {
  // If there is a recipient and the status is not pending, set it to pending
  if (data.recipient && data.status !== pendingStatus) {
    data.status = pendingStatus;
  } else if (!data.recipient && operation === 'create') {
    // If there is no recipient and the status is pending, set it to available
    data.status = availableStatus;
  }

  return data;
};
