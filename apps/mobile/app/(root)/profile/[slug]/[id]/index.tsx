import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import IndividualProfile from '@/features/profile/components/profile-screen/IndividualProfile';
import OrganizationProfile from '@/features/profile/components/profile-screen/OrganizationProfile';
import ProfilePosts from '@/features/profile/components/ProfilePosts';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { useMeUser } from '@/hooks/auth/useAuth';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';

type ProfileSlug = Extract<CollectionSlug, 'hospitals' | 'milkBanks' | 'individuals'>;

export default function ProfilePage() {
  const { id, slug } = useLocalSearchParams<{ slug: ProfileSlug; id: string }>();

  const { data: user, ...meUserQuery } = useMeUser();
  const isMeUser = extractID(user?.profile?.value) === id;

  const { data, ...profileQuery } = useProfileData(
    isMeUser ? user?.profile! : { relationTo: slug, value: id }
  );

  const profile = data?.value;
  const isRefetching = profileQuery.isRefetching;
  const isLoading = profileQuery.isLoading;

  const refresh = useCallback(() => {
    meUserQuery.refetch();
    profileQuery.refetch();
  }, [meUserQuery, profileQuery]);

  if (isLoading || !profile) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'Loading Profile...' }} />
        <LoadingSpinner />
      </>
    );
  }

  const headerTitle = isMeUser ? 'My Profile' : profile.displayName || 'Profile';

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <Stack.Screen options={{ headerTitle }} />
      <ProfilePosts
        profile={data}
        isRefreshing={isRefetching}
        onRefresh={refresh}
        HeaderComponent={({ profile }) => {
          if (profile.relationTo !== 'individuals') {
            return <OrganizationProfile profile={profile} />;
          }
          return <IndividualProfile profile={profile} />;
        }}
      />
    </SafeArea>
  );
}
