import { UserProfile } from '@lactalink/types';
import { User } from '@lactalink/types/payload-generated-types';
import { useQuery } from '@tanstack/react-query';
import {
  createMultipleProfilesByUsersQuery,
  createProfileByUserQuery,
  createUserProfileQuery,
} from '../lib/queryOption';

export function useProfileData(profile: UserProfile | undefined | null) {
  return useQuery(createUserProfileQuery(profile));
}

export function useUserProfile(user: string | User | undefined | null) {
  return useQuery(createProfileByUserQuery(user));
}

export function useMultipleUserProfiles(users: (string | User)[]) {
  return useQuery(createMultipleProfilesByUsersQuery(users));
}
