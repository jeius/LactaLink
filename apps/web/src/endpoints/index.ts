import { Endpoint } from 'payload';
import { seedNotificationsHandler } from './seeders/Notifications';
import { seedBarangaysHandler } from './seeders/PSGC/seedBarangays';
import { seedCitiesMunicipalitiesHandler } from './seeders/PSGC/seedCitiesMunicipalities';
import { seedIslandGroupsHandler } from './seeders/PSGC/seedIslandGroups';
import { seedProvincesHandler } from './seeders/PSGC/seedProvinces';
import { seedPSGCHandler } from './seeders/PSGC/seedPSGC';
import { seedRegionsHandler } from './seeders/PSGC/seedRegions';
import { seedStatusHandler } from './seeders/Status';

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
  {
    method: 'post',
    path: '/seed/provinces',
    handler: seedProvincesHandler,
  },
  {
    method: 'post',
    path: '/seed/cities-municipalities',
    handler: seedCitiesMunicipalitiesHandler,
  },
  {
    method: 'post',
    path: '/seed/barangays',
    handler: seedBarangaysHandler,
  },
  {
    method: 'get',
    path: '/seed/status',
    handler: seedStatusHandler,
  },
  {
    method: 'post',
    path: '/seed/status',
    handler: seedStatusHandler,
  },
  {
    method: 'post',
    path: '/seed/notifications',
    handler: seedNotificationsHandler,
  },
];
