import { nearDonationsOrRequestsHandler } from '@/endpoints/collections/nearDonationsOrRequests';
import { Endpoint } from 'payload';
import { createDonationHandler } from './createDonationHandler';
import { matchedRequestsHandler } from './matchedRequestsHandler';

export const donationsEndpoints: Endpoint[] = [
  {
    path: '/:id/matched-requests',
    method: 'get',
    handler: matchedRequestsHandler,
  },
  {
    path: '/near',
    method: 'get',
    handler: nearDonationsOrRequestsHandler,
  },
  {
    path: '/create',
    method: 'post',
    handler: createDonationHandler,
  },
];
