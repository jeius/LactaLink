import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { SetupProfileSchema } from '@lactalink/types';
import React from 'react';
import { useWatch } from 'react-hook-form';
import IndividualDetails from './individual-details';

export default function ProfileDetails() {
  const profileType = useWatch<SetupProfileSchema>().profileType;

  return (
    <Card>
      <VStack>{profileType && profileType === 'INDIVIDUAL' && <IndividualDetails />}</VStack>
    </Card>
  );
}
