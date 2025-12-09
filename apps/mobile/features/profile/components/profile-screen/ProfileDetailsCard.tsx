import { Card, CardProps } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UserProfile } from '@lactalink/types';
import { Hospital, Individual, MilkBank } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import {
  calculateAge,
  capitalizeFirst,
  formatNumberToShortenUnits,
} from '@lactalink/utilities/formatters';
import React, { Fragment, useEffect, useMemo } from 'react';

type IndividualDetailsProps = Omit<ProfileDetailsProps, 'profile'> & {
  profile: Individual;
};

type OrganizationDetailsProps = Omit<ProfileDetailsProps, 'profile'> & {
  profile: Hospital | MilkBank;
};

interface ProfileDetailsProps extends CardProps {
  profile: UserProfile;
}

function ProfileDetailsCard({ profile, ...props }: ProfileDetailsProps) {
  const slug = profile.relationTo;
  const profileData = extractCollection(profile.value);

  useEffect(() => {
    if (!profileData) {
      console.warn(`No profile data found for profile with slug: ${slug}`);
    }
  }, [profileData, slug]);

  if (!profileData) return null;

  if (slug === 'individuals') {
    return <IndividualDetails profile={profileData as Individual} {...props} />;
  }

  return <OrganizationDetails profile={profileData as Hospital | MilkBank} {...props} />;
}

function IndividualDetails({ profile, ...props }: IndividualDetailsProps) {
  const age = useMemo(() => calculateAge(profile.birth), [profile.birth]);
  const babies = profile.dependents || 0;
  const maritalStatus = capitalizeFirst(profile.maritalStatus.toLowerCase());
  return (
    <Card {...props}>
      <HStack space="sm" className="w-full items-stretch">
        <VStack space="sm" className="flex-1 items-center">
          <Text size="lg" bold>
            {babies}
          </Text>
          <Text size="sm">Dependents</Text>
        </VStack>
        <Divider orientation="vertical" />
        <VStack space="sm" className="flex-1 items-center">
          <Text size="lg" bold>
            {age}
          </Text>
          <Text size="sm">Age</Text>
        </VStack>
        <Divider orientation="vertical" />
        <VStack space="sm" className="flex-1 items-center justify-stretch">
          <Text size="sm" bold className="flex-1 text-center align-middle">
            {maritalStatus}
          </Text>
          <Text size="sm">Status</Text>
        </VStack>
      </HStack>
    </Card>
  );
}

function OrganizationDetails({ profile, ...props }: OrganizationDetailsProps) {
  const inStock = (profile.totalVolume ?? 0) / 1000; // Convert mL to L
  const sentTransactions = profile.sentTransactions?.docs?.length ?? 0;
  const receivedTransactions = profile.receivedTransactions?.docs?.length ?? 0;

  const details: { label: string; value: number }[] = [
    { label: 'Current Stock (Liters)', value: inStock },
    { label: 'Received Donations', value: receivedTransactions },
    { label: 'Fulfilled Requests', value: sentTransactions },
  ];

  return (
    <Card {...props}>
      <HStack space="sm" className="w-full items-stretch">
        {details.map((detail, index) => (
          <Fragment key={index}>
            <VStack space="sm" className="flex-1 items-center">
              <Text
                size="lg"
                ellipsizeMode="tail"
                numberOfLines={2}
                className="flex-1 text-center align-middle font-JakartaExtraBold"
              >
                {formatNumberToShortenUnits(detail.value, 2)}
              </Text>
              <Text size="sm" className="shrink text-center">
                {detail.label}
              </Text>
            </VStack>
            {index < details.length - 1 && <Divider orientation="vertical" />}
          </Fragment>
        ))}
      </HStack>
    </Card>
  );
}

export type { ProfileDetailsProps };

export default ProfileDetailsCard;
