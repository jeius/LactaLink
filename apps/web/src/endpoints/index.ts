import {
  DIRECTIONS_URL,
  ID_VERIFICATION_URL,
  SEED_BARANGAYS_URL,
  SEED_CITIES_MUNICIPALITIES_URL,
  SEED_ISLAND_GROUPS_URL,
  SEED_NOTIFICATIONS_URL,
  SEED_PROVINCES_URL,
  SEED_PSGC_URL,
  SEED_REGIONS_URL,
  SEED_STATUS_URL,
} from '@/lib/constants/routes';
import { Endpoint } from 'payload';
import getDirectionsHandler from './directions/getDirections';
import { idVerificationHandler } from './id-verification';
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
    path: SEED_PSGC_URL.replace('/api', ''),
    handler: seedPSGCHandler,
  },
  {
    method: 'post',
    path: SEED_ISLAND_GROUPS_URL.replace('/api', ''),
    handler: seedIslandGroupsHandler,
  },
  {
    method: 'post',
    path: SEED_REGIONS_URL.replace('/api', ''),
    handler: seedRegionsHandler,
  },
  {
    method: 'post',
    path: SEED_PROVINCES_URL.replace('/api', ''),
    handler: seedProvincesHandler,
  },
  {
    method: 'post',
    path: SEED_CITIES_MUNICIPALITIES_URL.replace('/api', ''),
    handler: seedCitiesMunicipalitiesHandler,
  },
  {
    method: 'post',
    path: SEED_BARANGAYS_URL.replace('/api', ''),
    handler: seedBarangaysHandler,
  },
  {
    method: 'get',
    path: SEED_STATUS_URL.replace('/api', ''),
    handler: seedStatusHandler,
  },
  {
    method: 'post',
    path: SEED_STATUS_URL.replace('/api', ''),
    handler: seedStatusHandler,
  },
  {
    method: 'post',
    path: SEED_NOTIFICATIONS_URL.replace('/api', ''),
    handler: seedNotificationsHandler,
  },
  {
    method: 'post',
    path: ID_VERIFICATION_URL.replace('/api', ''),
    handler: idVerificationHandler,
  },
  {
    method: 'post',
    path: DIRECTIONS_URL.replace('/api', ''),
    handler: getDirectionsHandler,
  },
];
