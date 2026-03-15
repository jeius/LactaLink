import { SetupProfileSteps } from '@/features/profile/lib/types';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import ProfileAvatarScreen from './AvatarScreen';
import ProfileContactScreen from './ContactScreen';
import ProfileDetailsScreen from './DetailsScreen';
import ProfileTypeScreen from './ProfileTypeScreen';

export default function ProfileSetupStepScreen() {
  const { step } = useLocalSearchParams<{ step: SetupProfileSteps }>();

  switch (step) {
    case 'avatar':
      return <ProfileAvatarScreen />;
    case 'contact':
      return <ProfileContactScreen />;
    case 'details':
      return <ProfileDetailsScreen />;
    case 'type':
      return <ProfileTypeScreen />;
    default:
      return <Redirect href={'/profile/setup'} />;
  }
}
