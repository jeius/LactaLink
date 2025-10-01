import { useFetchById } from '@/hooks/collections/useFetchById';
import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import isString from 'lodash/isString';
import React from 'react';
import { ProfileAvatar } from './Avatar';
import { Button, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { Skeleton } from './ui/skeleton';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

interface ProfileTagProps extends Pick<ContentProps, 'label' | 'direction'> {
  profile: User['profile'];
  isLoading?: boolean;
}
export function ProfileTag({ profile, isLoading, ...props }: ProfileTagProps) {
  return (
    <HStack
      space="sm"
      className={`items-center ${props.direction === 'rtl' ? 'flex-row-reverse' : ''}`}
    >
      {isLoading ? (
        <TagSkeleton direction={props.direction} />
      ) : (
        profile && <Content {...props} profile={profile} />
      )}
    </HStack>
  );
}

interface ContentProps {
  profile: NonNullable<User['profile']>;
  label: string;
  direction?: 'ltr' | 'rtl';
}

function Content({ profile, direction = 'ltr', label }: ContentProps) {
  // Fetch profile data if it's a reference
  const { data: fetchedProfile, isLoading } = useFetchById(isString(profile.value), {
    collection: profile.relationTo,
    id: extractID(profile.value),
  });

  const data = extractCollection(profile.value) || fetchedProfile;

  return isLoading ? (
    <TagSkeleton direction={direction} />
  ) : (
    data && (
      <>
        <ProfileAvatar size="sm" profile={data} enablePress />
        <VStack className={direction === 'rtl' ? 'items-end' : 'items-start'}>
          <Link asChild push href={`/profile/${profile.relationTo}/${data.id}`}>
            <Button
              animateOnPress={false}
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
      </>
    )
  );
}

function TagSkeleton({ direction = 'ltr' }: { direction?: ContentProps['direction'] }) {
  return (
    <>
      <Skeleton className="h-8 w-8" variant="circular" />
      <VStack className={direction === 'rtl' ? 'items-end' : 'items-start'}>
        <Skeleton className="mb-1 h-3 w-32" variant="circular" />
        <Skeleton className="h-3 w-16" variant="circular" />
      </VStack>
    </>
  );
}
