import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ProfileAvatar } from '@/components/Avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { PROFILE_TYPE_ICONS } from '@/lib/constants/profile';
import { User } from '@lactalink/types';
import { capitalizeFirst, extractCollection } from '@lactalink/utilities';
import { Link } from 'expo-router';
import { MailIcon, PhoneIcon } from 'lucide-react-native';
import React, { ComponentProps, ReactNode } from 'react';
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
        <ContentSkeleton />
      ) : (
        <HStack space="lg" className="w-full items-stretch">
          <VStack space="sm" className="items-center">
            <ProfileAvatar profile={profile} size="xl" />
            {profileType && (
              <HStack space="xs" className="items-center">
                <Icon as={profileIcon} size="xs" color={themeColors.typography[600]} />
                <Text size="xs" className="text-typography-600 text-center">
                  {profileType}
                </Text>
              </HStack>
            )}
          </VStack>

          <VStack space="sm" className="grow items-start">
            <Text className="font-JakartaMedium" ellipsizeMode="tail" numberOfLines={1}>
              {name}
            </Text>
            <HStack space="sm" className="items-center">
              <Icon as={MailIcon} size="lg" />
              <Text size="sm" ellipsizeMode="tail" numberOfLines={1}>
                {email}
              </Text>
            </HStack>

            <HStack space="sm" className="items-center">
              <Icon as={PhoneIcon} size="lg" />
              <Text size="sm" ellipsizeMode="tail" numberOfLines={1}>
                {phone}
              </Text>
            </HStack>

            <Link href={`/profile`} push asChild>
              <Button variant="link" action="default" className="p-0">
                <ButtonText>View Profile</ButtonText>
              </Button>
            </Link>
          </VStack>

          {action}
        </HStack>
      )}
    </Card>
  );
}

function ContentSkeleton() {
  return (
    <HStack space="lg" className="w-full">
      <VStack space="sm" className="items-center">
        <Skeleton className="h-24 w-24" variant="circular" />
        <Skeleton className="h-4 w-24" variant="circular" />
      </VStack>

      <VStack space="xs" className="items-stretch">
        <Skeleton className="h-8 w-32" variant="circular" />

        <Skeleton className="h-5 w-48" variant="circular" />

        <Skeleton className="h-5 w-32" variant="circular" />

        <Skeleton className="mt-2 h-10 w-48" variant="circular" />
      </VStack>
    </HStack>
  );
}
