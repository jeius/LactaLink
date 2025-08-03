import { Endpoint } from 'payload';
import { matchedDonationsHandler } from './matchedDonationsHandler';

export const requestsEndpoints: Endpoint[] = [
  {
    path: '/:id/matched-donations',
    method: 'get',
    handler: matchedDonationsHandler,
  },
];
