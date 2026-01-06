import { uploadImage } from '@/lib/api/file';
import { getApiClient } from '@lactalink/api';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import { PopulatedUserProfile } from '@lactalink/types';
import { mutationOptions } from '@tanstack/react-query';
import { createUserProfileQuery } from './queryOption';

export function createUpdateProfileMutation(profile: PopulatedUserProfile) {
  return mutationOptions({
    mutationKey: ['profile', 'update'],
    mutationFn: async ({ avatar, profileType: _, ...data }: Partial<SetupProfileSchema>) => {
      const avatarDoc = avatar && (await uploadImage('avatars', avatar));

      return getApiClient().updateByID({
        collection: profile.relationTo,
        id: profile.value.id,
        data: {
          ...data,
          avatar: avatarDoc === null ? null : avatarDoc?.id,
        },
        depth: 3,
      });
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      const queryKey = createUserProfileQuery(profile).queryKey;
      client.setQueryData(queryKey, {
        relationTo: profile.relationTo,
        value: data,
      } as PopulatedUserProfile);
    },
  });
}
