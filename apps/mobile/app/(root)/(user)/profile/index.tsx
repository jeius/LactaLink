import { useAuth } from '@/hooks/auth/useAuth';
import { extractID } from '@lactalink/utilities';
import { Redirect } from 'expo-router';
import React from 'react';

export default function ProfileRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href={'/auth/sign-in'} />;
  }

  if (!user.profile) {
    return <Redirect href={'/profile/setup'} />;
  }

  const profile = user.profile;
  const profileSlug = profile.relationTo;
  const profileID = extractID(profile.value);

  return <Redirect href={`/profile/${profileSlug}/${profileID}`} />;
}
