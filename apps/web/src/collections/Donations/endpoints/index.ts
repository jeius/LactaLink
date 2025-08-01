import { Endpoint } from 'payload';
import { matchedRequestsHandler } from './matchedRequestsHandler';

export const donationsEndpoints: Endpoint[] = [
  {
    path: '/:id/matched-requests',
    method: 'get',
    handler: matchedRequestsHandler,
  },
];
