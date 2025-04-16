import { wrapInternalEndpoints } from '@/lib/utils/wrapInternalEndpoints';
import { Endpoint } from 'payload';
import { getAuthHandler } from './getAuth';
import { googleAuthHandler } from './googleAuth';

export const collectionEndpoints: Endpoint[] = wrapInternalEndpoints([
  {
    method: 'post',
    path: '/auth/google',
    handler: googleAuthHandler,
  },
  {
    method: 'get',
    path: '/auth',
    handler: getAuthHandler,
  },
]);
