import { getApiClient } from '@lactalink/api';
import { queryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants/queryKeys';
import { setMeUser } from '../stores/meUserStore';

export const meUserQueryOptions = queryOptions({
  queryKey: QUERY_KEYS.AUTH.USER,
  queryFn: async () => {
    const apiClient = getApiClient();

    // Fetch meUser from API
    const user = await apiClient.auth.getMeUser();

    // Update meUser in store
    setMeUser(user);

    return user;
  },
  staleTime: Infinity,
  retry: false,
});

export const sessionQueryOptions = queryOptions({
  queryKey: QUERY_KEYS.AUTH.SESSION,
  queryFn: async ({ client }) => {
    const apiClient = getApiClient();

    // Fetch session from API
    const session = await apiClient.auth.getSession();

    const user = session?.user || null;

    // Update meUser in store and cache
    setMeUser(user);
    client.setQueryData(meUserQueryOptions.queryKey, user);

    return session;
  },
  staleTime: Infinity,
  retry: false,
});
