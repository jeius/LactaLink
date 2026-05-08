import { Endpoint } from 'payload';
import { validateExpiryHandler } from './validateExpiryHandler';

export const endpoints: Endpoint[] = [
  {
    path: '/validate-expiry',
    method: 'post',
    handler: validateExpiryHandler,
  },
];
