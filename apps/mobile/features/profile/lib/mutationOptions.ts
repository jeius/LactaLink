import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import { PopulatedUserProfile } from '@lactalink/types';
import { Hospital, Individual, MilkBank } from '@lactalink/types/payload-generated-types';
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
        json: data,
        init: init,
        args: { depth: 3 },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedProfile: Individual | Hospital | MilkBank = await response.json();
      return { ...profile, value: updatedProfile } as PopulatedUserProfile;
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      const queryKey = createUserProfileQuery(profile).queryKey;
      await client.invalidateQueries({ queryKey, exact: true });
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

      const profile: Individual | Hospital | MilkBank = await response.json();
      return { relationTo: slugMap[profileType], value: profile } as PopulatedUserProfile;
    },
    onSuccess: async (data, _vars, _ctx, { client }) => {
      const queryKey = createUserProfileQuery(data).queryKey;
      client.setQueryData(queryKey, data);

      await client.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.SESSION });
    },
  });
}
