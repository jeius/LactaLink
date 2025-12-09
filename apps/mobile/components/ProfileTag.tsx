import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { User } from '@lactalink/types/payload-generated-types';
import { isHospital, isMilkBank } from '@lactalink/utilities/type-guards';
import { Link } from 'expo-router';
import React from 'react';
import { ProfileAvatar } from './Avatar';
import { Button, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { Skeleton } from './ui/skeleton';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

interface ContentProps {
  profile: NonNullable<User['profile']>;
  label?: string;
  direction?: 'ltr' | 'rtl';
  hideLabel?: boolean;
}

interface ProfileTagProps extends Pick<ContentProps, 'label' | 'direction' | 'hideLabel'> {
  profile: User['profile'];
  isLoading?: boolean;
}
export function ProfileTag({ profile, isLoading, ...props }: ProfileTagProps) {
  return (
    <HStack
      space="sm"
      className={`items-center ${props.direction === 'rtl' ? 'flex-row-reverse' : ''}`}
    >
      {isLoading || profile === undefined ? (
        <TagSkeleton {...props} />
      ) : (
        profile && <Content {...props} profile={profile} />
      )}
    </HStack>
  );
}

function Content({
  profile,
  direction = 'ltr',
  label: labelProp,
  hideLabel = false,
}: ContentProps) {
  const { data: profileData, isLoading } = useProfileData(profile);
  const data = profileData?.value;
  const label =
    labelProp ||
    (data && (isHospital(data) ? 'Hospital' : isMilkBank(data) ? 'Milk Bank' : 'Individual'));

  if (isLoading || !data) return <TagSkeleton hideLabel={hideLabel} direction={direction} />;

  return (
    <>
      <ProfileAvatar size="sm" enablePress profile={profile} />
      {!hideLabel && (
        <VStack className={direction === 'rtl' ? 'items-end' : 'items-start'}>
          <Link asChild push href={`/profile/${profile.relationTo}/${data.id}`}>
            <Button
              disablePressAnimation
              size="xs"
              variant="link"
              action="default"
              className="h-fit w-fit p-0"
              hitSlop={8}
            >
              <ButtonText underlineOnPress numberOfLines={1} ellipsizeMode="tail">
                {data.displayName}
              </ButtonText>
            </Button>
          </Link>
          <Text size="xs" className="text-typography-700">
            {label}
          </Text>
        </VStack>
      )}
    </>
  );
}

function TagSkeleton({ direction = 'ltr', hideLabel = false }: Omit<ContentProps, 'profile'>) {
  return (
    <>
      <Skeleton className="h-8 w-8" variant="circular" />
      {!hideLabel && (
        <VStack className={direction === 'rtl' ? 'items-end' : 'items-start'}>
          <Skeleton className="mb-1 h-3 w-32" variant="circular" />
          <Skeleton className="h-3 w-16" variant="circular" />
        </VStack>
      )}
    </>
  );
}
