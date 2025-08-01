import { Donation, Request } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

export const initializeStatus: CollectionBeforeChangeHook<Donation | Request> = ({
  operation,
  data,
}) => {
  if (operation !== 'create' || !data) return data;

  data.status = data.recipient ? 'PENDING' : 'AVAILABLE';

  return data;
};
