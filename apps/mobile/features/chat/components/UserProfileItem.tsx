import { ProfileAvatar } from '@/components/Avatar';
import { HStack, HStackProps } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { User } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { isIndividual } from '@lactalink/utilities/type-guards';
import React from 'react';
import { StyleSheet } from 'react-native';

interface UserProfileItemProps extends HStackProps {
  profile: NonNullable<User['profile']>;
}

export default function UserProfileItem({ profile, space = 'sm', ...props }: UserProfileItemProps) {
  const profileDoc = extractCollection(profile.value);
  const displayName =
    profileDoc?.displayName ||
    (profileDoc && (isIndividual(profileDoc) ? profileDoc.givenName : profileDoc.name));

  return (
    <HStack
      {...props}
      space={space}
      style={StyleSheet.flatten([{ alignItems: 'center' }, props.style])}
    >
      <ProfileAvatar profile={profile} className="h-12 w-12" />
      <Text numberOfLines={1} className="shrink font-JakartaSemiBold">
        {displayName}
      </Text>
    </HStack>
  );
}
