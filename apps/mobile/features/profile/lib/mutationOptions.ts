import { getApiClient } from '@lactalink/api';
import { ImageSchema, SetupProfileSchema } from '@lactalink/form-schemas';
import { PopulatedUserProfile } from '@lactalink/types';
import { CreateResult, UpdateByIDResult } from '@lactalink/types/api';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { mutationOptions } from '@tanstack/react-query';
import { File as ExpoFile } from 'expo-file-system';
import { Platform } from 'react-native';
import { createUserProfileQuery } from './queryOption';

const slugMap: Record<
  SetupProfileSchema['profileType'],
  Extract<CollectionSlug, 'hospitals' | 'individuals' | 'milkBanks'>
> = {
  HOSPITAL: 'hospitals',
  INDIVIDUAL: 'individuals',
  MILK_BANK: 'milkBanks',
};

async function createAvatarFile(avatar?: ImageSchema | null): Promise<Blob | undefined> {
  if (!avatar?.url || avatar.id) return undefined;

  if (Platform.OS !== 'web') return new ExpoFile(avatar.url);

  const response = await fetch(avatar.url);
  if (!response.ok) throw new Error('Failed to read the selected avatar.');

  const blob = await response.blob();
  return new globalThis.File([blob], avatar.filename || 'avatar.jpg', {
    type: avatar.mimeType || blob.type || 'image/jpeg',
  });
}

export function createEditProfileMutationOptions(
  profile: PopulatedUserProfile,
  init?: RequestInit
) {
  return mutationOptions({
    mutationKey: ['profile', 'update'],
    mutationFn: async ({ avatar, profileType: _, ...data }: Partial<SetupProfileSchema>) => {
      const file = await createAvatarFile(avatar);

      const response = await getApiClient().request({
        path: `/${profile.relationTo}/${extractID(profile.value)}`,
        method: 'PATCH',
        file,
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
      const file = await createAvatarFile(avatar);

      const response = await getApiClient().request({
        path: `/${slugMap[profileType]}`,
        method: 'POST',
        file,
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
    },
  });
}
