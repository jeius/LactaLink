import { User } from '@lactalink/types/payload-generated-types';
import { QueryClient } from '@tanstack/react-query';
import { meUserQueryOptions } from '../queries/authQueryOptions';
import { setMeUser } from '../stores/meUserStore';

/**
 * Adds or updates the authenticated user in the cache and store.
 * @param client - The `QueryClient` instance.
 * @param user - The authenticated `User` object or `null`.
 */
export function addUserToCache(client: QueryClient, user: User | null) {
  const queryKey = meUserQueryOptions.queryKey;

  // Update meUser in cache
  client.setQueryData(queryKey, user);

  // Update meUser in store as well to keep it in sync
  setMeUser(user);
}
