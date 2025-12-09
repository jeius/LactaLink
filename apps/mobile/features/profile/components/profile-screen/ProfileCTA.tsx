import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { HandBottleIcon, MilkBottlePlus2Icon } from '@/components/ui/icon/custom';
import { RecipientSearchParams } from '@/lib/types/donationRequest';
import { UserProfile } from '@lactalink/types';
import { extractID } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';

import React from 'react';

interface ProfileCTAProps {
  profile: UserProfile;
}

export default function ProfileCTA({ profile }: ProfileCTAProps) {
  const params: RecipientSearchParams = {
    rid: extractID(profile.value),
    rslg: profile.relationTo,
  };

  return (
    <HStack space="lg" className="w-full items-stretch">
      <Link asChild push href={{ pathname: `/donations/create`, params }}>
        <Button className="flex-1">
          <ButtonIcon size="xl" as={HandBottleIcon} style={{ width: 24, height: 24 }} />
          <ButtonText>Donate</ButtonText>
        </Button>
      </Link>
      <Link asChild push href={{ pathname: `/requests/create`, params }}>
        <Button action="tertiary" className="flex-1">
          <ButtonIcon size="xl" as={MilkBottlePlus2Icon} style={{ width: 24, height: 24 }} />
          <ButtonText>Request</ButtonText>
        </Button>
      </Link>
    </HStack>
  );
}
