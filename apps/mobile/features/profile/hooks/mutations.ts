import { PopulatedUserProfile } from '@lactalink/types';
import { useMutation } from '@tanstack/react-query';
import { createUpdateProfileMutation } from '../lib/mutationOptions';

export function useUpdateProfileMutation(profile: PopulatedUserProfile) {
  return useMutation(createUpdateProfileMutation(profile));
}
