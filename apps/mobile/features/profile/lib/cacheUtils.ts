import { PopulatedUserProfile } from '@lactalink/types';
import { QueryClient } from '@tanstack/react-query';
import { createUserProfileQuery } from './queryOption';

/**
 * Adds the given profile to the React Query cache.
 */
export function addToProfileCache(client: QueryClient, profile: PopulatedUserProfile) {
  const queryKey = createUserProfileQuery(profile).queryKey;
  client.setQueryData(queryKey, profile);
}
