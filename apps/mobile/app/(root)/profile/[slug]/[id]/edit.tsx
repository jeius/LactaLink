import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { Box } from '@/components/ui/box';
import ProfileEditForm from '@/features/profile/components/edit';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { useMeUser } from '@/hooks/auth/useAuth';
import { createDirectionalShadow } from '@/lib/utils/shadows';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProfileSlug = Extract<CollectionSlug, 'hospitals' | 'milkBanks' | 'individuals'>;

export default function ProfileEditPage() {
  const insets = useSafeAreaInsets();

  const { id, slug } = useLocalSearchParams<{ slug: ProfileSlug; id: string }>();

  const { data: user } = useMeUser();
  const isMeUser = extractID(user?.profile?.value) === id;

  const { data, ...profileQuery } = useProfileData(
    isMeUser ? user?.profile! : { relationTo: slug, value: id }
  );

  const isLoading = profileQuery.isLoading;

  if (isLoading || !data) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          animation: 'slide_from_bottom',
          presentation: 'transparentModal',
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Box
        style={{
          paddingBottom: insets.bottom,
          marginTop: insets.top,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          ...createDirectionalShadow('top'),
        }}
        className="flex-1 border border-outline-200 bg-background-50"
      >
        <ProfileEditForm profile={data} />
      </Box>
    </>
  );
}
