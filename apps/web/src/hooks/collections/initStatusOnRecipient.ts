import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Donation, Request } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

const pendingStatus = DONATION_REQUEST_STATUS.PENDING.value;
const availableStatus = DONATION_REQUEST_STATUS.AVAILABLE.value;

export const initStatusOnRecipient: CollectionBeforeChangeHook<Donation | Request> = ({
  operation,
  data,
}) => {
  if (operation !== 'create') return data;

  // If there is a recipient and the status is not pending, set it to pending
  if (data.recipient && data.status !== pendingStatus) {
    data.status = pendingStatus;
  } else if (!data.recipient) {
    // If there is no recipient set it to available
    data.status = availableStatus;
  }

  return data;
};
