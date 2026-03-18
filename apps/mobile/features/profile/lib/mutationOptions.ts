import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import { PopulatedUserProfile } from '@lactalink/types';
import { CreateResult, UpdateByIDResult } from '@lactalink/types/api';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { mutationOptions } from '@tanstack/react-query';
import { File } from 'expo-file-system';
import { createUserProfileQuery } from './queryOption';

const slugMap: Record<
  SetupProfileSchema['profileType'],
  Extract<CollectionSlug, 'hospitals' | 'individuals' | 'milkBanks'>
> = {
  HOSPITAL: 'hospitals',
  INDIVIDUAL: 'individuals',
  MILK_BANK: 'milkBanks',
};

export function createEditProfileMutationOptions(
  profile: PopulatedUserProfile,
  init?: RequestInit
) {
  return mutationOptions({
    mutationKey: ['profile', 'update'],
    mutationFn: async ({ avatar, profileType: _, ...data }: Partial<SetupProfileSchema>) => {
      const avatarURI = avatar?.url;

      const response = await getApiClient().request({
        path: `/${profile.relationTo}/${extractID(profile.value)}`,
        method: 'PATCH',
        file: avatarURI ? new File(avatarURI) : undefined,
        json: avatar ? { ...data, avatar: avatar.id } : { ...data, avatar },
        init: init,
        args: { depth: 3 },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result: UpdateByIDResult = await response.json();
      return { ...profile, value: result.doc } as PopulatedUserProfile;
    },
    onSuccess: async (data, _vars, _ctx, { client }) => {
      const queryKey = createUserProfileQuery(profile).queryKey;
      client.setQueryData(queryKey, data);
    },
  });
}

export function createNewProfileMutationOptions(init?: RequestInit) {
  return mutationOptions({
    mutationKey: ['profile', 'create'],
    mutationFn: async ({ avatar, profileType, ...data }: SetupProfileSchema) => {
      const avatarURI = avatar?.url;

      const response = await getApiClient().request({
        path: `/${slugMap[profileType]}`,
        method: 'POST',
        file: avatarURI ? new File(avatarURI) : undefined,
        json: data,
        init: init,
        args: { depth: 3 },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create profile');
      }

      const result: CreateResult = await response.json();
      return { relationTo: slugMap[profileType], value: result.doc } as PopulatedUserProfile;
    },
    onSuccess: async (data, _vars, _ctx, { client }) => {
      const queryKey = createUserProfileQuery(data).queryKey;
      client.setQueryData(queryKey, data);

      await client.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.SESSION });
    },
  });
}
