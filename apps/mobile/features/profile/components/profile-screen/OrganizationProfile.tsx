import { AnimatedPressable } from '@/components/animated/pressable';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { SingleImageViewer } from '@/components/ImageViewer';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { PROFILE_TYPE_ICONS } from '@/features/profile/lib/constants';
import { Shade } from '@/lib/types/colors';
import { isMeUser } from '@/lib/utils/isMeUser';
import { createDirectionalShadow } from '@/lib/utils/shadows';
import { PopulatedUserProfile } from '@lactalink/types';
import { Individual } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractImageData } from '@lactalink/utilities/extractors';
import { capitalizeFirst } from '@lactalink/utilities/formatters';
import { Link } from 'expo-router';
import { Edit2Icon } from 'lucide-react-native';
import React from 'react';
import ProfileCTA from './ProfileCTA';
import ProfileDetailsCard from './ProfileDetailsCard';
import ProfileDetailsList from './ProfileDetailsList';

interface OrganizationProfileProps {
  profile: Exclude<PopulatedUserProfile, { value: Individual }>;
}

export default function OrganizationProfile({
  profile: { relationTo, value: profile },
}: OrganizationProfileProps) {
  const { themeColors } = useTheme();

  const user = extractCollection(profile.owner);

  const isOwner = user && isMeUser(user);

  const name = profile?.displayName || profile.name || 'No name';

  const profileType = user?.profileType && capitalizeFirst(user.profileType.toLowerCase());
  const profileIcon =
    (user?.profileType && PROFILE_TYPE_ICONS[user.profileType]) || PROFILE_TYPE_ICONS.INDIVIDUAL;

  const getAccentColor = (shade: Shade) => themeColors.secondary[shade];

  const avatar = extractCollection(profile.avatar);
  const avatarImage = avatar ? extractImageData(avatar) : null;
  const avatarRingColor = getAccentColor('300');
  const bgGradientColors = [getAccentColor('50')!, getAccentColor('200')!] as const;
  const backgroundColor = getAccentColor('200');

  return (
    <VStack className="flex-col items-stretch" style={{ backgroundColor }}>
      <Box className="h-28 w-full p-2">
        <GradientBackground colors={bgGradientColors} />
      </Box>

      <VStack
        space="md"
        style={{
          ...createDirectionalShadow('top'),
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        className="relative grow items-stretch bg-background-50 p-5"
      >
        <VStack className="items-center" style={{ marginTop: -60 }}>
          <SingleImageViewer
            image={avatarImage}
            size="lg"
            className="overflow-hidden rounded-full"
            style={{ borderColor: avatarRingColor, borderWidth: 3 }}
            fallback={
              <Avatar size="xl">
                <AvatarFallbackText>{name}</AvatarFallbackText>
              </Avatar>
            }
          />

          <Text size="lg" className="font-JakartaSemiBold">
            {name}
          </Text>

          <HStack space="xs" className="mt-1 items-center">
            <Icon as={profileIcon} size="xs" />
            <Text italic size="sm" ellipsizeMode="tail" numberOfLines={1}>
              {profileType}
            </Text>
          </HStack>
        </VStack>

        {isOwner && (
          <Box className="absolute" style={{ top: 8, right: 8 }}>
            <Link href={`/profile/${relationTo}/${profile.id}/edit`} asChild>
              <AnimatedPressable className="overflow-hidden rounded-full p-4">
                <Icon as={Edit2Icon} />
              </AnimatedPressable>
            </Link>
          </Box>
        )}

        {!isOwner && <ProfileCTA profile={{ relationTo, value: profile }} />}

        <ProfileDetailsList profile={{ relationTo, value: profile }} />

        <ProfileDetailsCard profile={{ relationTo, value: profile }} className="mt-2 p-2" />
      </VStack>
    </VStack>
  );
}
