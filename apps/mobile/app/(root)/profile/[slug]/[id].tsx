import SafeArea from '@/components/SafeArea';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { CollectionSlug } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

type ProfileSlug = Extract<CollectionSlug, 'individuals' | 'hospitals' | 'milkBanks'>;

export default function ProfilePage() {
  const { slug, id } = useLocalSearchParams<{ slug: ProfileSlug; id: string }>();
  const { data: user } = useMeUser();
  const meUserProfile = extractCollection(user?.profile?.value);
  const isMeUserProfile = meUserProfile?.id === id && user?.profile?.relationTo === slug;

  const {
    data: fetchedProfile,
    isLoading,
    isFetching,
    error,
  } = useFetchById(!isMeUserProfile, {
    collection: slug,
    id,
  });

  const profile = isMeUserProfile ? meUserProfile : fetchedProfile;
  const name = profile && ('name' in profile ? profile.name : profile.givenName);

  const headerTitle = isMeUserProfile ? 'My Profile' : (name && `${name}'s Profile`) || 'Profile';

  return (
    <>
      <Stack.Screen options={{ title: headerTitle, headerShown: true }} />
      <SafeArea>
        <VStack>
          <Text>{headerTitle}</Text>
        </VStack>
      </SafeArea>
    </>
  );
}
