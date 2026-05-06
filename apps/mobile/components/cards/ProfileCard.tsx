import Avatar from '@/components/Avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractDisplayName, extractID } from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import { MailIcon, PhoneIcon } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable } from '../ui/pressable';
import { Skeleton } from '../ui/skeleton';

interface ProfileCardProps extends CardProps {
  profile: NonNullable<User['profile']>;
  isLoading?: boolean;
  action?: ReactNode;
  hideBadge?: boolean;
  disableNavigation?: boolean;
}

export default function ProfileCard({
  profile: profileProp,
  isLoading: isLoadingProp,
  variant = 'ghost',
  action,
  disableNavigation = false,
  ...cardProps
}: ProfileCardProps) {
  const router = useRouter();
  const profileSlug = profileProp.relationTo;

  const { data, ...rest } = useProfileData(profileProp);
  const profile = data?.value;
  const isLoading = isLoadingProp || rest.isLoading;

  const user = extractCollection(profile?.owner) || null;

  const name = (data && extractDisplayName({ profile: data })) || 'User';
  const email = user?.email || 'No email';
  const phone = profile?.phone || 'No phone number';

  const navigateToProfile = () => {
    if (disableNavigation) return;
    router.push(`/profile/${profileSlug}/${extractID(profileProp.value)}`);
  };

  return (
    <Card variant={variant} {...cardProps}>
      {isLoading ? (
        <ProfileCardSkeleton />
      ) : (
        <HStack space="lg" className="w-full items-center">
          <Pressable
            className="relative overflow-hidden rounded-full"
            pointerEvents={disableNavigation ? 'none' : 'auto'}
            onPress={navigateToProfile}
          >
            <Avatar profile={profileProp} size="xl" />
          </Pressable>

          <VStack space="sm" className="flex-1 items-start">
            <Button
              disablePressAnimation
              variant="link"
              action="default"
              className="h-fit w-fit p-0"
              onPress={navigateToProfile}
              pointerEvents={disableNavigation ? 'none' : 'auto'}
            >
              <ButtonText numberOfLines={1} className="flex-1" size="md">
                {name}
              </ButtonText>
            </Button>

            <HStack space="sm" className="items-center">
              <Icon as={MailIcon} size="sm" />
              <Text size="sm" numberOfLines={1} className="flex-1">
                {email}
              </Text>
            </HStack>

            <HStack space="sm" className="items-center">
              <Icon as={PhoneIcon} size="sm" />
              <Text size="sm" numberOfLines={1} className="flex-1">
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
