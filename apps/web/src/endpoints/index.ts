import { Endpoint } from 'payload';
import { seedIslandGroupsHandler } from './seeders/PSGC/seedIslandGroups';
import { seedPSGCHandler } from './seeders/PSGC/seedPSGC';
import { seedRegionsHandler } from './seeders/PSGC/seedRegions';

export const Endpoints: Endpoint[] = [
  {
    method: 'post',
    path: '/seed/psgc',
    handler: seedPSGCHandler,
  },
  {
    method: 'post',
    path: '/seed/island-groups',
    handler: seedIslandGroupsHandler,
  },
  {
    method: 'post',
    path: '/seed/regions',
    handler: seedRegionsHandler,
  },
  // {
  //   method: 'get',
  //   path: '/seed/status',
  //   handler: seedStatusHandler,
  // },
];
