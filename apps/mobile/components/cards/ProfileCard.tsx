import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ProfileAvatar } from '@/components/Avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { PROFILE_TYPE_ICONS } from '@/lib/constants/profile';
import { Hospital, Individual, MilkBank, User } from '@lactalink/types';
import { capitalizeFirst, extractCollection, isIndividual } from '@lactalink/utilities';
import { Link } from 'expo-router';
import { MailIcon, PhoneIcon } from 'lucide-react-native';
import React, { ComponentProps, ReactNode, useMemo } from 'react';
import { Box } from '../ui/box';
import { Divider } from '../ui/divider';
import { Skeleton } from '../ui/skeleton';

interface ProfileCardProps extends ComponentProps<typeof Card> {
  profile: User['profile'];
  isLoading?: boolean;
  action?: ReactNode;
}

export default function ProfileCard({
  profile: profileProp,
  isLoading,
  variant = 'ghost',
  action,
  ...cardProps
}: ProfileCardProps) {
  const { themeColors } = useTheme();

  const profile = extractCollection(profileProp?.value) || null;
  const user = extractCollection(profile?.owner) || null;

  const name = (profile && ('name' in profile ? profile.name : profile.displayName)) || 'No name';
  const email = user?.email || 'No email';
  const phone = user?.phone || 'No phone number';
  const profileType = user?.profileType && capitalizeFirst(user.profileType.toLowerCase());
  const profileIcon =
    (user?.profileType && PROFILE_TYPE_ICONS[user.profileType]) || PROFILE_TYPE_ICONS.INDIVIDUAL;

  return (
    <Card variant={variant} {...cardProps}>
      {isLoading ? (
        <ProfileCardSkeleton />
      ) : (
        <HStack space="lg" className="w-full items-center">
          <Box className="relative h-full">
            <ProfileAvatar profile={profile} size="xl" className="aspect-square w-auto" />
            {profileType && (
              <Box className="bg-background-0 absolute right-1 top-0 rounded-full p-1.5">
                <Icon as={profileIcon} size="xs" color={themeColors.typography[700]} />
              </Box>
            )}
          </Box>

          <VStack space="sm" className="flex-1 items-start">
            <Link href={`/profile`} push asChild>
              <Button
                animateOnPress={false}
                variant="link"
                action="default"
                className="h-fit w-fit p-0"
              >
                <ButtonText underlineOnPress ellipsizeMode="tail" numberOfLines={1}>
                  {name}
                </ButtonText>
              </Button>
            </Link>
            <HStack space="sm" className="items-center">
              <Icon as={MailIcon} size="sm" />
              <Text size="sm" ellipsizeMode="tail" numberOfLines={1}>
                {email}
              </Text>
            </HStack>

            <HStack space="sm" className="items-center">
              <Icon as={PhoneIcon} size="sm" />
              <Text size="sm" ellipsizeMode="tail" numberOfLines={1}>
                {phone}
              </Text>
            </HStack>
          </VStack>

          {action}
        </HStack>
      )}
    </Card>
  );
}

function ProfileCardSkeleton() {
  return (
    <HStack space="lg" className="w-full items-center">
      <Skeleton className="h-24 w-24" variant="circular" />

      <VStack space="xs" className="flex-1 items-start">
        <Skeleton className="h-8 w-32" variant="circular" />
        <Skeleton className="h-5 w-48" variant="circular" />
        <Skeleton className="h-5 w-32" variant="circular" />
      </VStack>
    </HStack>
  );
}

interface IndividualDetailsProps extends ComponentProps<typeof Card> {
  profile: Individual;
}
export function IndividualDetails({ profile, ...props }: IndividualDetailsProps) {
  const individualDetails = useMemo(() => {
    if (!profile || !isIndividual(profile)) {
      return null;
    }

    const birthDate = new Date(profile.birth);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    const babies = profile.dependents || 0;
    const maritalStatus = capitalizeFirst(profile.maritalStatus.toLowerCase());
    return { age, babies, maritalStatus };
  }, [profile]);

  return (
    individualDetails && (
      <Card {...props}>
        <HStack space="sm" className="w-full items-stretch">
          <VStack space="sm" className="flex-1 items-center">
            <Text size="lg" bold>
              {individualDetails.babies}
            </Text>
            <Text size="sm">Dependents</Text>
          </VStack>
          <Divider orientation="vertical" />
          <VStack space="sm" className="flex-1 items-center">
            <Text size="lg" bold>
              {individualDetails.age}
            </Text>
            <Text size="sm">Age</Text>
          </VStack>
          <Divider orientation="vertical" />
          <VStack space="sm" className="flex-1 items-center justify-stretch">
            <Text size="sm" bold className="flex-1 text-center align-middle">
              {individualDetails.maritalStatus}
            </Text>
            <Text size="sm">Status</Text>
          </VStack>
        </HStack>
      </Card>
    )
  );
}

interface OrganizationDetailsProps extends ComponentProps<typeof Card> {
  profile: Hospital | MilkBank;
}

export function OrganizationDetails({ profile, ...props }: OrganizationDetailsProps) {
  const orgDetails = useMemo(() => {
    if (!profile || isIndividual(profile)) {
      return null;
    }

    const inStock = profile.totalVolume || 0;
    const sentTransactions = profile.sentTransactions?.docs?.length || 0;
    const receivedTransactions = profile.receivedTransactions?.docs?.length || 0;
    return { inStock, sentTransactions, receivedTransactions };
  }, [profile]);

  return (
    orgDetails && (
      <Card {...props}>
        <HStack space="sm" className="w-full items-stretch">
          <VStack space="sm" className="flex-1 items-center">
            <Text
              size="lg"
              ellipsizeMode="tail"
              numberOfLines={2}
              bold
              className="flex-1 text-center align-middle"
            >
              {orgDetails.inStock.toLocaleString()}
            </Text>
            <Text size="sm" className="shrink text-center">
              Current Stock (mL)
            </Text>
          </VStack>
          <Divider orientation="vertical" />
          <VStack space="sm" className="flex-1 items-center">
            <Text
              size="lg"
              ellipsizeMode="tail"
              numberOfLines={2}
              bold
              className="flex-1 text-center align-middle"
            >
              {orgDetails.receivedTransactions.toLocaleString()}
            </Text>
            <Text size="sm" className="shrink text-center">
              Received Donations
            </Text>
          </VStack>
          <Divider orientation="vertical" />
          <VStack space="sm" className="flex-1 items-center">
            <Text
              size="lg"
              ellipsizeMode="tail"
              numberOfLines={2}
              bold
              className="flex-1 text-center align-middle"
            >
              {orgDetails.sentTransactions.toLocaleString()}
            </Text>
            <Text size="sm" className="shrink text-center">
              Fulfilled Requests
            </Text>
          </VStack>
        </HStack>
      </Card>
    )
  );
}
