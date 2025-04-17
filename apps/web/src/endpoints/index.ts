import { Endpoint } from 'payload';
import { seedPSGCHandler } from './seeders/PSGC';

export const Endpoints: Endpoint[] = [
  {
    method: 'get',
    path: '/seed/psgc',
    handler: seedPSGCHandler,
  },
];
