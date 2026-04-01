import { nearDonationsOrRequestsHandler } from '@/endpoints/collections/nearDonationsOrRequests';
import { Endpoint } from 'payload';
import { matchedDonationsHandler } from './matchedDonationsHandler';
import { requestCreationHandler } from './requestCreationHandler';

export const requestsEndpoints: Endpoint[] = [
  {
    path: '/:id/matched-donations',
    method: 'get',
    handler: matchedDonationsHandler,
  },
  {
    path: '/near',
    method: 'get',
    handler: nearDonationsOrRequestsHandler,
  },
  {
    path: '/create',
    method: 'post',
    handler: requestCreationHandler,
  },
];
