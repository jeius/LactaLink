import { PopulatedUserProfile } from '@lactalink/types';
import { QueryClient } from '@tanstack/react-query';
import { createProfileByUserQuery, createUserProfileQuery } from './queryOption';

/**
 * Adds the given profile to the React Query cache.
 */
export function addProfileToAllCache(client: QueryClient, profile: PopulatedUserProfile) {
  client.setQueryData(createUserProfileQuery(profile).queryKey, profile);
  client.setQueryData(createProfileByUserQuery(profile.value.owner).queryKey, profile);
}

export function addToProfileCache(client: QueryClient, profile: PopulatedUserProfile) {
  client.setQueryData(createUserProfileQuery(profile).queryKey, profile);
}

export function addToUserProfileCache(client: QueryClient, profile: PopulatedUserProfile) {
  client.setQueryData(createProfileByUserQuery(profile.value.owner).queryKey, profile);
}
