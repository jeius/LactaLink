import { initServerApi } from '@/lib/api/init/server';
import { getServerApiClient } from '@lactalink/api';
import { cache } from 'react';

export const getServerApi = cache(async () => {
  await initServerApi();
  return getServerApiClient();
});
