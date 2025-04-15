import { wrapInternalEndpoints } from '@/lib/utils/wrapInternalEndpoints';
import { Endpoint } from 'payload';
import { googleLoginHandler } from './googleLogin';

export const collectionEndpoints: Endpoint[] = wrapInternalEndpoints([
  {
    method: 'post',
    path: '/login/google',
    handler: googleLoginHandler,
  },
]);
