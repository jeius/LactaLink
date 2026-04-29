import { nearOrganizationsHandler } from '@/endpoints/collections/nearOrganizations';
import { Endpoint } from 'payload';

export const organizationEndpoints: Endpoint[] = [
  {
    path: '/near',
    method: 'get',
    handler: nearOrganizationsHandler,
  },
];
