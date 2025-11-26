import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ProfileAvatar } from '@/components/Avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { PROFILE_TYPE_ICONS } from '@/features/profile/lib/constants';
import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { capitalizeFirst } from '@lactalink/utilities/formatters';
import { Link } from 'expo-router';
import { MailIcon, PhoneIcon } from 'lucide-react-native';
import React, { ComponentProps, ReactNode } from 'react';
import { Box } from '../ui/box';
import { Skeleton } from '../ui/skeleton';

interface ProfileCardProps extends ComponentProps<typeof Card> {
  profile: NonNullable<User['profile']>;
  isLoading?: boolean;
  action?: ReactNode;
}

export default function ProfileCard({
  profile: profileProp,
  isLoading: isLoadingProp,
  variant = 'ghost',
  action,
  ...cardProps
}: ProfileCardProps) {
  const { themeColors } = useTheme();

  const profileSlug = profileProp.relationTo;

  const { data: profile, ...rest } = useProfileData(profileProp);
  const isLoading = isLoadingProp || rest.isLoading;

  const user = extractCollection(profile?.owner) || null;

  const name = (profile && ('name' in profile ? profile.name : profile.displayName)) || 'No name';
  const email = user?.email || 'No email';
  const phone = user?.phone || 'No phone number';
  const profileType = user?.profileType && capitalizeFirst(user.profileType.toLowerCase());
  const profileIcon =
    (user?.profileType && PROFILE_TYPE_ICONS[user.profileType]) || PROFILE_TYPE_ICONS.INDIVIDUAL;

  return (
    <Card variant={variant} {...cardProps}>
      {isLoading || profile === undefined ? (
        <ProfileCardSkeleton />
      ) : (
        <HStack space="lg" className="w-full items-center">
          <Box className="relative h-full">
            <ProfileAvatar profile={profileProp} size="xl" className="aspect-square w-auto" />
            {profileType && (
              <Box className="absolute right-1 top-0 rounded-full bg-background-0 p-1.5">
                <Icon as={profileIcon} size="xs" color={themeColors.typography[700]} />
              </Box>
            )}
          </Box>

          <VStack space="sm" className="flex-1 items-start">
            <Link href={`/profile/${profileSlug}/${profile.id}`} push asChild>
              <Button
                disablePressAnimation
                variant="link"
                action="default"
                className="h-fit w-fit p-0"
              >
                <ButtonText
                  underlineOnPress
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  className="flex-1"
                >
                  {name}
                </ButtonText>
              </Button>
            </Link>
            <HStack space="sm" className="items-center">
              <Icon as={MailIcon} size="sm" />
              <Text size="sm" ellipsizeMode="tail" numberOfLines={1} className="flex-1">
                {email}
              </Text>
            </HStack>

            <HStack space="sm" className="items-center">
              <Icon as={PhoneIcon} size="sm" />
              <Text size="sm" ellipsizeMode="tail" numberOfLines={1} className="flex-1">
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
