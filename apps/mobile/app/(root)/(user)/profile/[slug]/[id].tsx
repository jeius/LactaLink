import SafeArea from '@/components/SafeArea';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { CollectionSlug } from '@lactalink/types';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

type ProfileSlug = Extract<CollectionSlug, 'individuals' | 'hospitals' | 'milkBanks'>;

export default function ProfilePage() {
  const { slug, id } = useLocalSearchParams<{ slug: ProfileSlug; id: string }>();
  const auth = useAuth();

  const isAuthenticatedUser = auth.profile?.id === id;

  const {
    data: fetchedProfile,
    isLoading,
    isFetching,
    error,
  } = useFetchById(isAuthenticatedUser, {
    collection: slug,
    id,
  });

  const profile = isAuthenticatedUser ? auth.profile : fetchedProfile;
  const name = profile && ('name' in profile ? profile.name : profile.givenName);

  const headerTitle = isAuthenticatedUser
    ? 'My Profile'
    : (name && `${name}'s Profile`) || 'Profile';

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
