import { createUserProfileQuery } from '@/lib/queries/usersQueryOptions';
import { UserProfile } from '@lactalink/types';
import { useQuery } from '@tanstack/react-query';

export function useProfileData(profile: UserProfile | undefined) {
  return useQuery(createUserProfileQuery(profile));
}
