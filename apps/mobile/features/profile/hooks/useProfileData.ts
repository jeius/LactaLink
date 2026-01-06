import { UserProfile } from '@lactalink/types';
import { useQuery } from '@tanstack/react-query';
import { createUserProfileQuery } from '../lib/queryOption';

export function useProfileData(profile: UserProfile | undefined) {
  return useQuery(createUserProfileQuery(profile));
}
