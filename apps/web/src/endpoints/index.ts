import { Endpoint } from 'payload';
import { seedPSGCHandler } from './seeders/PSGC';
import { seedStatusHandler } from './seeders/Status';

export const Endpoints: Endpoint[] = [
  {
    method: 'post',
    path: '/seed/psgc',
    handler: seedPSGCHandler,
  },
  {
    method: 'get',
    path: '/seed/status',
    handler: seedStatusHandler,
  },
];
