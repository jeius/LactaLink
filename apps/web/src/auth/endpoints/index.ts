import { wrapInternalEndpoints } from '@/lib/utils/wrapInternalEndpoints';
import { Endpoint } from 'payload';
import { getAuthHandler } from './getAuth';

export const collectionEndpoints: Endpoint[] = wrapInternalEndpoints([
  {
    method: 'get',
    path: '/auth',
    handler: getAuthHandler,
  },
]);
